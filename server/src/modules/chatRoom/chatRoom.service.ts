import { CreateChatRoomDTO } from "./dtos/create-room.dto";
import { IChatRoom } from "./chatRoom.model";
import { ChatRoomRepository } from "./roomChat.repo";

export interface IChatRoomService {
  createChatRoom(data: CreateChatRoomDTO): Promise<IChatRoom>;
  getByID(roomID: string): Promise<IChatRoom | null>;
}

export class ChatRoomService implements IChatRoomService {
  constructor(private readonly chatRoomRepository: ChatRoomRepository) {}

  public async createChatRoom(data: CreateChatRoomDTO): Promise<IChatRoom> {
    const newRoom = await this.chatRoomRepository.createChatRoom(data);
    return newRoom;
  }

  public async getByID(roomID: string): Promise<IChatRoom | null> {
    const room = this.chatRoomRepository.findChatRoomById(roomID);

    return room;
  }
}

