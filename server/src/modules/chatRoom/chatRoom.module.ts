import { Router } from "express";
import { ChatRoomRepository } from "./chatRoom.repo";
import { ChatRoomService } from "./chatRoom.service";
import { ChatRoomController } from "./chatRoom.controller";
import { validateBody } from "../../shared/utils/validate";
import { CreateChatRoomSchema } from "./dtos/create-room.dto";
import { roomIDSchema } from "./dtos/get-room-id.dto";
import { RabbitMQClient } from "../../shared/rabbitmq/RabbitMQClient";

export class ChatRoomModule {
  private chatRoomController: ChatRoomController;

  constructor(readonly rabbitClient: RabbitMQClient) {
    const chatRepository = new ChatRoomRepository();
    const userService = new ChatRoomService(chatRepository, rabbitClient);

    this.chatRoomController = new ChatRoomController(userService);
  }

  public createRouter(): Router {
    const router = Router();

    router.post("", validateBody(CreateChatRoomSchema), (req, res) => {
      return this.chatRoomController.createChatRoom(req, res);
    });

    router.get("/:roomID", validateBody(roomIDSchema, "params"), (req, res) =>
      this.chatRoomController.getByID(req, res)
    );

    return router;
  }
}

