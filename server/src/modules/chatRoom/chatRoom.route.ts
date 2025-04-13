import { Router } from "express";
import { ChatRoomRepository } from "./roomChat.repo";
import { ChatRoomService } from "./chatRoom.service";
import { ChatRoomController } from "./chatRoom.controller";
import { validateBody } from "../../shared/utils/validate";
import { CreateChatRoomSchema } from "./dtos/create-room.dto";

const router = Router();

const chatRoomRepository = new ChatRoomRepository();
const chatRoomService = new ChatRoomService(chatRoomRepository);
const chatRoomController = new ChatRoomController(chatRoomService);

router.post("", validateBody(CreateChatRoomSchema), (req, res) => {
  chatRoomController.createChatRoom(req, res);
});

export default router;

