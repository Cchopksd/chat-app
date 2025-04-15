import { Router } from "express";
import { ChatController } from "./chat.controller";
import { ChatRepository } from "./chat.repo";
import { ChatService } from "./chat.service";

export class ChatModule {
  private chatController: ChatController;

  constructor() {
    const chatRepository = new ChatRepository();
    const chatService = new ChatService(chatRepository);

    this.chatController = new ChatController(chatService);
  }

  public createRouter(): Router {
    const router = Router();

    router.post("", (req, res) => {
      return this.chatController.createChat(req, res);
    });
    return router;
  }
}

