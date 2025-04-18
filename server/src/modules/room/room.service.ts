import { CreateChatRoomDTO } from "./dtos/create-room.dto";
import { IChatRoom } from "./room.model";
import { IChatRoomRepository } from "./room.repo";
import { RabbitMQClient } from "../../shared/rabbitmq/RabbitMQClient";
import { BadRequestException } from "../../shared/exceptions/http.exception";
import { QUEUE_NAMES } from "../../shared/rabbitmq/queues";
import { AddMemberDTO } from "./dtos/add-member.dto";
import { ObjectId } from "mongodb";

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

    const users = await Promise.all(
      data.members.map(async (memberId) => {
        return this.rabbitClient.sendRPC<any[]>(QUEUE_NAMES.USER.GET_USER, {
          id: memberId,
        });
      })
    );

    if (
      !users ||
      users.length !== data.members.length ||
      users.some((user) => !user)
    ) {
      throw new BadRequestException("One or more users do not exist");
    }

    const isGroup = data.isGroup ?? false;

    if (!isGroup) {
      const existingRoom = await this.chatRoomRepository.findOneToOneRoom(
        data.members[0],
        data.members[1] 
      );

      if (existingRoom) {
        return existingRoom;
      }

      return await this.chatRoomRepository.createChatRoom({
        ...data,
        members: data.members.map((member) => new ObjectId(member)),
        type: "one_to_one",
        isPrivate: true,
      });
    }

    return await this.chatRoomRepository.createChatRoom({
      name: data.name,
      members: data.members.map((member) => new ObjectId(member)),
      type: "group",
      isPrivate: data.isPrivate ?? true,
    });
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
