import { Router } from "express";
import { UserController } from "./user.controller";
import { UserService } from "./user.service";
import { UserRepository } from "./user.repo";
import { validateBody } from "../../shared/utils/validate";
import { CreateUserSchema } from "./dtos/create-user.dto";

const router = Router();

// Dependency Injection
const userRepository = new UserRepository();
const userService = new UserService(userRepository);
const userController = new UserController(userService);

router.post("", validateBody(CreateUserSchema), (req, res) =>
  userController.createUser(req, res)
);
router.get("", (req, res) => userController.getAllUsers(req, res));
router.get("/info", (req, res) => userController.findByUserInfo(req, res));

export default router;

