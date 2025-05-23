import { HydratedDocument } from "mongoose";
import { IChat, ChatModel } from "./chat.model";

export interface IChatRepository {
  createChat(data: Partial<IChat>): Promise<HydratedDocument<IChat>>;
  findChatByRoomID(id: string): Promise<IChat[]>;
  findChatByRoomIDWithLimit(id: string): Promise<IChat[]>;
}

export class ChatRepository implements IChatRepository {
  async createChat(data: Partial<IChat>): Promise<HydratedDocument<IChat>> {
    const chat = new ChatModel(data);
    return chat.save();
  }

  async findChatByRoomID(id: string): Promise<IChat[]> {
    const chat = await ChatModel.find({ room_id: id })
      .populate("sender_id")
      .sort({ createdAt: -1 });
    return chat;
  }

  async findChatByRoomIDWithLimit(id: string): Promise<IChat[]> {
    const chat = await ChatModel.find({ room_id: id })
      .sort({ createdAt: -1 })
      .limit(1);
    return chat;
  }
}

