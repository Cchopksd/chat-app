import { Channel, ConsumeMessage } from "amqplib";
import { v4 as uuidv4 } from "uuid";

type RPCResponseHandler = (data: any) => void;

export class RabbitMQClient {
  private readonly replyQueue = "amq.rabbitmq.reply-to";
  private correlationMap: Map<string, RPCResponseHandler> = new Map();

  private async setupPubSub() {
    await this.channel.assertExchange("chat_exchange", "topic", {
      durable: true,
    });
  }

  constructor(private channel: Channel) {
    this.listenForReplies(); // ✅ setup reply handler only once
    this.setupPubSub();
  }

  private listenForReplies() {
    this.channel.consume(
      this.replyQueue,
      (msg: ConsumeMessage | null) => {
        if (msg) {
          const correlationId = msg.properties.correlationId;
          const handler = this.correlationMap.get(correlationId);

          if (handler) {
            const result = JSON.parse(msg.content.toString());
            handler(result);
            this.correlationMap.delete(correlationId); // clean up
          }
        }
      },
      { noAck: true }
    );
  }

  public async publish(exchange: string, routingKey: string, payload: object) {
    await this.channel.assertExchange(exchange, "topic", { durable: true });

    this.channel.publish(
      exchange,
      routingKey,
      Buffer.from(JSON.stringify(payload))
    );
  }

  public async subscribe(
    exchange: string,
    queueName: string,
    routingKey: string,
    handler: (payload: any) => Promise<void>
  ) {
    await this.channel.assertExchange(exchange, "topic", { durable: true });
  
    const queue = await this.channel.assertQueue(queueName, {
      exclusive: true,
    });
  
    await this.channel.bindQueue(queue.queue, exchange, routingKey);
  
    this.channel.consume(queue.queue, async (msg) => {
      if (msg) {
        const payload = JSON.parse(msg.content.toString()); // ✅ แก้ตรงนี้
        await handler(payload);
        this.channel.ack(msg);
      }
    });
  }
  

  public async sendRPC<T>(queueName: string, payload: object): Promise<T> {
    const correlationId = uuidv4();

    return new Promise((resolve) => {
      this.correlationMap.set(correlationId, resolve);

      this.channel.sendToQueue(
        queueName,
        Buffer.from(JSON.stringify(payload)),
        {
          replyTo: this.replyQueue,
          correlationId,
        }
      );
    });
  }

  public async consume(queue: string, handler: (payload: any) => Promise<any>) {
    await this.channel.assertQueue(queue);
    this.channel.consume(queue, async (msg) => {
      if (msg) {
        const payload = JSON.parse(msg.content.toString());
        const result = await handler(payload);

        if (msg.properties.replyTo) {
          this.channel.sendToQueue(
            msg.properties.replyTo,
            Buffer.from(JSON.stringify(result)),
            {
              correlationId: msg.properties.correlationId,
            }
          );
        }

        this.channel.ack(msg);
      }
    });
  }
}
