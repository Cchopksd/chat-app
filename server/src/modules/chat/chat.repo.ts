import { IChat, ChatModel } from "./chat.model";

export interface IChatRepository {
  createChat(data: Partial<IChat>): Promise<IChat>;
}

export class ChatRepository implements IChatRepository {
  async createChat(data: Partial<IChat>): Promise<IChat> {
    const chat = new ChatModel(data);
    return chat.save();
  }
}