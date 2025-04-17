import { Router } from "express";
import { RabbitMQClient } from "../../shared/rabbitmq/RabbitMQClient";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { validateBody } from "../../shared/utils/validate";
import { LoginSchema } from "./dtos/login.dto";

export class AuthModule {
  private AuthController: AuthController;

  constructor(readonly rabbitClient: RabbitMQClient) {
    const userService = new AuthService(rabbitClient);

    this.AuthController = new AuthController(userService);
  }

  public createRouter(): Router {
    const router = Router();

    router.post("/login", validateBody(LoginSchema), (req, res) => {
      return this.AuthController.login(req, res);
    });

    return router;
  }
}

