import { CreateChatRoomDTO } from "./dtos/create-room.dto";
import { IChatRoom } from "./chatRoom.model";
import { ChatRoomRepository } from "./chatRoom.repo";
import { RabbitMQClient } from "../../shared/rabbitmq/RabbitMQClient";
import { BadRequestException } from "../../shared/exceptions/http.exception";
import { QUEUE_NAMES } from "../../shared/rabbitmq/queues";

export interface IChatRoomService {
  createChatRoom(data: CreateChatRoomDTO): Promise<IChatRoom>;
  getByID(roomID: string): Promise<IChatRoom | null>;
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
      { id: data.members.map((member) => member) }
    );

    if (!users || users.length === 0) {
      throw new BadRequestException("User does not exist");
    }
    const newRoom = await this.chatRoomRepository.createChatRoom(data);

    return newRoom;
  }

  public async getByID(roomID: string): Promise<IChatRoom | null> {
    const room = this.chatRoomRepository.findChatRoomById(roomID);
    return room;
  }

  private hasDuplicates<T>(arr: T[]): boolean {
    return new Set(arr).size !== arr.length;
  }
}

