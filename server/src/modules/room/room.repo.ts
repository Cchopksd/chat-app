import { IChatRoom, ChatRoomModel } from "./room.model";

export interface IChatRoomRepository {
  createChatRoom(data: Partial<IChatRoom>): Promise<IChatRoom>;
  findChatRoomById(id: string): Promise<IChatRoom | null>;
  findMemberInRoom(roomId: string, memberId: string): Promise<boolean>;
  modifiedMember(data: any): Promise<IChatRoom | null>;
  findOneToOneRoom(userA: string, userB: string): Promise<IChatRoom | null>;
  findChatRoomsByMember(memberId: string): Promise<IChatRoom[]>;
}

export class ChatRoomRepository implements IChatRoomRepository {
  async createChatRoom(data: Partial<IChatRoom>): Promise<IChatRoom> {
    const chatRoom = new ChatRoomModel(data);
    return chatRoom.save();
  }

  async findChatRoomById(id: string): Promise<IChatRoom | null> {
    return ChatRoomModel.findById(id).lean();
  }

  async findMemberInRoom(roomId: string, memberId: string): Promise<boolean> {
    const room = await ChatRoomModel.findOne({
      _id: roomId,
      members: memberId,
    }).lean();

    return !!room;
  }

  async modifiedMember(data: any): Promise<IChatRoom | null> {
    const room = await ChatRoomModel.findByIdAndUpdate(
      data.room_id,
      { $set: { members: data.members } },
      { new: true }
    );
    console.log(room);
    return room;
  }

  async findChatRoomsByMember(memberId: string): Promise<IChatRoom[]> {
    return ChatRoomModel.find({ members: memberId }).exec();
  }

  async findOneToOneRoom(userA: string, userB: string) {
    return await ChatRoomModel.findOne({
      type: "one_to_one",
      members: { $all: [userA, userB], $size: 2 },
    });
  }
}
