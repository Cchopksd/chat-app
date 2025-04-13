import { Router } from "express";
import { UserController } from "../controllers/user.controller";
import { UserService } from "../services/user.service";
import { UserRepository } from "../repositories/user.repo";
import { validateBody } from "../utils/validate";
import { CreateUserSchema } from "../dtos/create-user.dto";

const router = Router();

// Dependency Injection
const userRepository = new UserRepository();
const userService = new UserService(userRepository);
const userController = new UserController(userService);

router.post("/", validateBody(CreateUserSchema), (req, res) =>
  userController.createUser(req, res)
);
router.get("/", (req, res) => userController.getAllUsers(req, res));

export default router;

