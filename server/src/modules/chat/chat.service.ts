import { IChat } from "./chat.model";
import { ChatRepository } from "./chat.repo";
import { CreateChatDTO } from "./dtos/create-chat.dto";
import { ObjectId } from "mongodb";

export interface IChatService {
  createChat(data: CreateChatDTO): Promise<IChat>;
}

export class ChatService implements IChatService {
  constructor(private readonly chatRepository: ChatRepository) {}

  public async createChat(data: CreateChatDTO): Promise<IChat> {
    const chat = await this.chatRepository.createChat({
      ...data,
      room_id: new ObjectId(data.room_id),
      sender_id: new ObjectId(data.sender_id),
    });

    return chat;
  }
}

