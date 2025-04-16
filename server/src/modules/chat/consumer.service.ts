import { RabbitMQClient } from "../../shared/rabbitmq/RabbitMQClient";
import { ChatRPCConsumer } from "./chat.customer";
import { ChatService } from "./chat.service";

export class ChatConsumerService {
  constructor(
    private readonly rabbitClient: RabbitMQClient,
    private readonly chatService: ChatService
  ) {}

  public async initConsumers(): Promise<void> {
    const consumers = [
      new ChatRPCConsumer(this.rabbitClient, this.chatService),
    ];

    await Promise.all(consumers.map((c) => c.init()));
    
  }
}

