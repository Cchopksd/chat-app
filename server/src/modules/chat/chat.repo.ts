import { IChat, ChatModel } from "./chat.model";

export interface IChatRepository {
  createChat(data: Partial<IChat>): Promise<IChat>;
  findChatByRoomID(id: string): Promise<IChat[]>;
}

export class ChatRepository implements IChatRepository {
  async createChat(data: Partial<IChat>): Promise<IChat> {
    const chat = new ChatModel(data);
    return chat.save();
  }

  async findChatByRoomID(id: string): Promise<IChat[]> {
    const chat = await ChatModel.find({ room_id: id });
    return chat;
  }
}