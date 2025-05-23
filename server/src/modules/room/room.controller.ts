import { Request, Response } from "express";
import { IChatRoomService } from "./room.service";
import { successResponse } from "../../shared/exceptions/http.exception";
import { CreateChatRoomDTO } from "./dtos/create-room.dto";

export class ChatRoomController {
  constructor(private readonly chatRoomService: IChatRoomService) {}

  public async createChatRoom(req: Request, res: Response): Promise<void> {
    const chatRoom = await this.chatRoomService.createChatRoom(
      req.body as CreateChatRoomDTO
    );
    successResponse(res, chatRoom, "Chat room created successfully");
  }

  public async getByID(req: Request, res: Response): Promise<void> {
    const roomID = req.params.roomID;
    const chatRoom = await this.chatRoomService.getByID(roomID);
    successResponse(res, chatRoom, "Room retrieved successfully");
  }

  public async findByUser(req: Request, res: Response): Promise<void> {
    const userID = req.params.userID;
    const chatRoom = await this.chatRoomService.findByUser(userID);
    successResponse(res, chatRoom, "Room retrieved successfully");
  }

  public async modifiedMember(req: Request, res: Response): Promise<void> {
    const chatRoom = await this.chatRoomService.modifiedMember(req.body);
    successResponse(res, chatRoom, "Room updated successfully");
  }
}
