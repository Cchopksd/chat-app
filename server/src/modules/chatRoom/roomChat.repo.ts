import { IChatRoom, ChatRoomModel } from "./chatRoom.model";

export interface IChatRoomRepository {
  createChatRoom(data: Partial<IChatRoom>): Promise<IChatRoom>;
  findChatRoomById(id: string): Promise<IChatRoom | null>;
  findChatRoomsByMember(memberId: string): Promise<IChatRoom[]>;
}

export class ChatRoomRepository implements IChatRoomRepository {
  async createChatRoom(data: Partial<IChatRoom>): Promise<IChatRoom> {
    const chatRoom = new ChatRoomModel(data);
    return chatRoom.save();
  }

  async findChatRoomById(id: string): Promise<IChatRoom | null> {
    return ChatRoomModel.findById(id).populate("chat").exec();
  }

  async findChatRoomsByMember(memberId: string): Promise<IChatRoom[]> {
    return ChatRoomModel.find({ members: memberId }).exec();
  }
}

