// src/modules/user/user.module.ts
import { Router } from "express";
import { UserController } from "./user.controller";
import { UserService } from "./user.service";
import { UserRepository } from "./user.repo";
import { RabbitMQClient } from "../../shared/rabbitmq/RabbitMQClient";
import { validateBody } from "../../shared/utils/validate";
import { CreateUserSchema } from "./dtos/create-user.dto";
import { ConsumerService } from "./consumer.service";

export class UserModule {
  private userController: UserController;
  private consumerService: ConsumerService;

  constructor(readonly rabbitClient: RabbitMQClient) {
    const userRepository = new UserRepository();
    const userService = new UserService(userRepository);

    this.userController = new UserController(userService);
    this.consumerService = new ConsumerService(rabbitClient, userService);
  }

  public async initializeConsumers() {
    await this.consumerService.initializeConsumers();
  }

  public createRouter(): Router {
    const router = Router();

    router.post("", validateBody(CreateUserSchema), (req, res) =>
      this.userController.createUser(req, res)
    );

    router.get("", (req, res) => this.userController.getAllUsers(req, res));
    router.get("/info", (req, res) =>
      this.userController.findByUserInfo(req, res)
    );

    return router;
  }
}

