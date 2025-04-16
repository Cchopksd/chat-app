import { RabbitMQClient } from "../../shared/rabbitmq/RabbitMQClient";
import { IChat } from "./chat.model";
import { ChatRepository, IChatRepository } from "./chat.repo";
import { CreateChatDTO } from "./dtos/create-chat.dto";
import { ObjectId } from "mongodb";

export interface IChatService {
  createChat(data: CreateChatDTO): Promise<IChat>;
  findChatByRoomID(id: string): Promise<IChat[]>;
}

export class ChatService implements IChatService {
  constructor(
    private readonly chatRepository: IChatRepository,
    private readonly rabbitClient: RabbitMQClient
  ) {}

  public async createChat(data: CreateChatDTO): Promise<IChat> {
    const chat = await this.chatRepository.createChat({
      ...data,
      room_id: new ObjectId(data.room_id),
      sender_id: new ObjectId(data.sender_id),
    });

    return chat;
  }

  public async findChatByRoomID(id: string): Promise<IChat[]> {
    const chats = await this.chatRepository.findChatByRoomID(id);
    return chats;
  }
}

