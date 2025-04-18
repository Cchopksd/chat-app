import { QUEUE_NAMES } from "../../shared/rabbitmq/queues";
import { RabbitMQClient } from "../../shared/rabbitmq/RabbitMQClient";
import { ChatService, IChatService } from "./chat.service";

export interface RpcResponse<T> {
  chats: T | null;
}

export class ChatRPCConsumer {
  constructor(
    private readonly client: RabbitMQClient,
    private readonly chatService: IChatService
  ) {}

  public async init(): Promise<void> {
    await this.client.consume(
      QUEUE_NAMES.CHAT.GET_CHATS,
      this.handleGetChatData.bind(this)
    );

    await this.client.consume(
      QUEUE_NAMES.CHAT.GET_CHATS_WITH_LIMIT,
      this.handleGetChatDataWithLimit.bind(this)
    );
  }

  private async handleGetChatData(payload: {
    id: string;
  }): Promise<RpcResponse<any>> {
    const chats = await this.chatService.findChatByRoomID(payload.id);
    return { chats };
  }

  private async handleGetChatDataWithLimit(payload: {
    id: string;
  }): Promise<any> {
    const chats = await this.chatService.findChatByRoomIDWithLimit(payload.id);
    return chats;
  }
}

