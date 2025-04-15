import { Channel, ConsumeMessage } from "amqplib";
import { v4 as uuidv4 } from "uuid";

type RPCResponseHandler = (data: any) => void;

export class RabbitMQClient {
  private readonly replyQueue = "amq.rabbitmq.reply-to";
  private correlationMap: Map<string, RPCResponseHandler> = new Map();

  constructor(private channel: Channel) {
    this.listenForReplies(); // ✅ setup reply handler only once
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

