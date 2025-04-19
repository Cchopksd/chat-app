import { Request, Response } from "express";
import { successResponse } from "../../shared/exceptions/http.exception";
import { IChatService } from "./chat.service";

export class ChatController {
  constructor(private readonly chatService: IChatService) {}

  public async createChat(req: Request, res: Response): Promise<void> {
    const chat = await this.chatService.createChat(req.body);

    successResponse(res, chat, "Chat created successfully");
  }

  public async findChatByRoomID(req: Request, res: Response): Promise<void> {
    const chats = await this.chatService.findChatByRoomID(req.params.roomID);

    successResponse(res, chats, "Chat retrieved successfully");
  }
}

