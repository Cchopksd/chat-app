import { HydratedDocument } from "mongoose";
import { RabbitMQClient } from "../../shared/rabbitmq/RabbitMQClient";
import { IChat } from "./chat.model";
import { ChatRepository, IChatRepository } from "./chat.repo";
import { CreateChatDTO } from "./dtos/create-chat.dto";
import { ObjectId } from "mongodb";

export interface IChatService {
  createChat(data: CreateChatDTO): Promise<HydratedDocument<IChat>>;
  findChatByRoomID(id: string): Promise<IChat[]>;
  findChatByRoomIDWithLimit(id: string): Promise<IChat[]>;
}

export class ChatService implements IChatService {
  constructor(
    private readonly chatRepository: IChatRepository,
    private readonly rabbitClient: RabbitMQClient
  ) {}

  public async createChat(
    data: CreateChatDTO
  ): Promise<HydratedDocument<IChat>> {
    const savedChat = await this.chatRepository.createChat({
      ...data,
      room_id: new ObjectId(data.room_id),
      sender_id: new ObjectId(data.sender_id),
    });

    await this.rabbitClient.publish("chat_exchange", `room.${data.room_id}`, {
      roomId: data.room_id,
      message: savedChat,
    });

    return savedChat;
  }

  public async findChatByRoomID(id: string): Promise<IChat[]> {
    const chats = await this.chatRepository.findChatByRoomID(id);
    return chats;
  }

  public async findChatByRoomIDWithLimit(id: string): Promise<IChat[]> {
    const chats = await this.chatRepository.findChatByRoomIDWithLimit(id);
    return chats;
  }

  public async getUnreadCount(roomId: string, userId: string): Promise<number> {
    const messages = await this.chatRepository.findChatByRoomID(roomId);

    const unreadMessages = messages.filter(
      (message) => !message.readBy.includes(userId)
    );

    return unreadMessages.length;
  }
}

