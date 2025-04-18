import { Router } from "express";
import { ChatRoomRepository } from "./room.repo";
import { ChatRoomService } from "./room.service";
import { ChatRoomController } from "./room.controller";
import { validateBody } from "../../shared/utils/validate";
import { CreateChatRoomSchema } from "./dtos/create-room.dto";
import { roomIDSchema } from "./dtos/get-room-id.dto";
import { RabbitMQClient } from "../../shared/rabbitmq/RabbitMQClient";
import { AuthMiddleware } from "../../shared/middlewares/auth.middleware";
import { AddMemberSchema } from "./dtos/add-member.dto";
import { userIDSchema } from "./dtos/get-user-id.dto";

export class ChatRoomModule {
  private chatRoomController: ChatRoomController;

  constructor(readonly rabbitClient: RabbitMQClient) {
    const chatRepository = new ChatRoomRepository();
    const userService = new ChatRoomService(chatRepository, rabbitClient);

    this.chatRoomController = new ChatRoomController(userService);
  }

  public createRouter(): Router {
    const router = Router();

    router.post(
      "",
      AuthMiddleware.handleAuthentication,
      validateBody(CreateChatRoomSchema),
      (req, res) => {
        return this.chatRoomController.createChatRoom(req, res);
      }
    );

    router.get(
      "/:roomID",
      validateBody(roomIDSchema, "params"),
      AuthMiddleware.handleAuthentication,
      (req, res) => this.chatRoomController.getByID(req, res)
    );

    router.get(
      "/user/:userID",
      validateBody(userIDSchema, "params"),
      AuthMiddleware.handleAuthentication,
      (req, res) => this.chatRoomController.findByUser(req, res)
    );

    router.patch(
      "/modified-member",
      validateBody(AddMemberSchema),
      AuthMiddleware.handleAuthentication,
      (req, res) => this.chatRoomController.modifiedMember(req, res)
    );

    return router;
  }
}
