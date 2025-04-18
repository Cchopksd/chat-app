import { CreateChatRoomDTO } from "./dtos/create-room.dto";
import { IChatRoom } from "./room.model";
import { IChatRoomRepository } from "./room.repo";
import { RabbitMQClient } from "../../shared/rabbitmq/RabbitMQClient";
import { BadRequestException } from "../../shared/exceptions/http.exception";
import { QUEUE_NAMES } from "../../shared/rabbitmq/queues";
import { AddMemberDTO } from "./dtos/add-member.dto";

export interface IChatRoomService {
  createChatRoom(data: CreateChatRoomDTO): Promise<IChatRoom>;
  getByID(roomID: string): Promise<any | null>;
  modifiedMember(data: AddMemberDTO): Promise<IChatRoom | null>;
}

export class ChatRoomService implements IChatRoomService {
  constructor(
    private readonly chatRoomRepository: IChatRoomRepository,
    private readonly rabbitClient: RabbitMQClient
  ) {}

  public async createChatRoom(data: CreateChatRoomDTO): Promise<IChatRoom> {
    if (this.hasDuplicates(data.members)) {
      throw new BadRequestException("Duplicate user IDs are not allowed");
    }

    const users = await this.rabbitClient.sendRPC<any[]>(
      QUEUE_NAMES.USER.GET_USER,
      { id: data.members }
    );

    if (!users || users.length === 0) {
      throw new BadRequestException("User does not exist");
    }

    const newRoom = await this.chatRoomRepository.createChatRoom(data);

    return newRoom;
  }

  public async getByID(roomID: string): Promise<any | null> {
    const room = await this.chatRoomRepository.findChatRoomById(roomID);

    const chats = await this.rabbitClient.sendRPC<any>(
      QUEUE_NAMES.CHAT.GET_CHATS,
      { id: roomID }
    );
    return {
      ...room,
      ...chats,
    };
  }

  public async modifiedMember(data: AddMemberDTO): Promise<IChatRoom | null> {
    const existRoom = await this.chatRoomRepository.findChatRoomById(
      data.room_id
    );

    if (!existRoom) {
      throw new BadRequestException("Room is not defied");
    }

    const room = await this.chatRoomRepository.modifiedMember(data);

    return room;
  }

  private hasDuplicates<T>(arr: T[]): boolean {
    return new Set(arr).size !== arr.length;
  }
}
