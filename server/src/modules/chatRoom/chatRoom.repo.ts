import { IChatRoom, ChatRoomModel } from "./chatRoom.model";

export interface IChatRoomRepository {
  createChatRoom(data: Partial<IChatRoom>): Promise<IChatRoom>;
  findChatRoomById(id: string): Promise<IChatRoom | null>;
  findMemberInRoom(roomId: string, memberId: string): Promise<boolean>;
  findChatRoomsByMember(memberId: string): Promise<IChatRoom[]>;
}

export class ChatRoomRepository implements IChatRoomRepository {
  async createChatRoom(data: Partial<IChatRoom>): Promise<IChatRoom> {
    const chatRoom = new ChatRoomModel(data);
    return chatRoom.save();
  }

  async findChatRoomById(id: string): Promise<IChatRoom | null> {
    return ChatRoomModel.findById(id).exec();
  }

  async findMemberInRoom(roomId: string, memberId: string): Promise<boolean> {
    const room = await ChatRoomModel.findOne({
      _id: roomId,
      members: memberId,
    }).lean();

    return !!room;
  }

  async findChatRoomsByMember(memberId: string): Promise<IChatRoom[]> {
    return ChatRoomModel.find({ members: memberId }).exec();
  }
}

