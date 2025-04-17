import { CreateChatRoomDTO } from "./dtos/create-room.dto";
import { IChatRoom } from "./chatRoom.model";
import { ChatRoomRepository } from "./chatRoom.repo";
import { RabbitMQClient } from "../../shared/rabbitmq/RabbitMQClient";
import { BadRequestException } from "../../shared/exceptions/http.exception";
import { QUEUE_NAMES } from "../../shared/rabbitmq/queues";

export interface IChatRoomService {
  createChatRoom(data: CreateChatRoomDTO): Promise<IChatRoom>;
  getByID(roomID: string): Promise<any | null>;
}

export class ChatRoomService implements IChatRoomService {
  constructor(
    private readonly chatRoomRepository: ChatRoomRepository,
    private readonly rabbitClient: RabbitMQClient
  ) {}

  public async createChatRoom(data: CreateChatRoomDTO): Promise<IChatRoom> {
    if (this.hasDuplicates(data.members)) {
      throw new BadRequestException("Duplicate user IDs are not allowed");
    }

    const users = await this.rabbitClient.sendRPC<any[]>(
      QUEUE_NAMES.USER.GET_USER,
      { id: data.members}
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

  private hasDuplicates<T>(arr: T[]): boolean {
    return new Set(arr).size !== arr.length;
  }
}

