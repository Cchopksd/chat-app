import { Router } from "express";
import { ChatController } from "./chat.controller";
import { ChatRepository } from "./chat.repo";
import { ChatService } from "./chat.service";
import { validateBody } from "../../shared/utils/validate";
import { CreateChatSchema } from "./dtos/create-chat.dto";
import { roomIDSchema } from "./dtos/get-room-id.dto";
import { RabbitMQClient } from "../../shared/rabbitmq/RabbitMQClient";
import { ChatConsumerService } from "./consumer.service";

export class ChatModule {
  private chatController: ChatController;
  private chatConsumerService: ChatConsumerService;

  constructor(readonly rabbitClient: RabbitMQClient) {
    const chatRepository = new ChatRepository();
    const chatService = new ChatService(chatRepository, rabbitClient);

    this.chatController = new ChatController(chatService);
    this.chatConsumerService = new ChatConsumerService(
      rabbitClient,
      chatService
    );
  }

  public async initializeConsumers() {
    await this.chatConsumerService.initConsumers();
  }

  public createRouter(): Router {
    const router = Router();

    router.post("", validateBody(CreateChatSchema), (req, res) =>
      this.chatController.createChat(req, res)
    );

    router.get(
      "/room-id/:roomID",
      validateBody(roomIDSchema, "params"),
      (req, res) => this.chatController.findChatByRoomID(req, res)
    );

    return router;
  }
}

