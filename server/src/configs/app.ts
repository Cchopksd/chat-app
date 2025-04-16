import express, { Application, ErrorRequestHandler } from "express";
import morgan from "morgan";
import helmet from "helmet";
import cors from "cors";

import { UserModule } from "../modules/user/user.module";

import { ChatRoomModule } from "../modules/chatRoom/chatRoom.module";
import { RabbitMQClient } from "../shared/rabbitmq/RabbitMQClient";
import {
  errorHandler,
  handleSyntaxError,
  notFound,
} from "../shared/middlewares/error.middleware";
import { ChatModule } from "../modules/chat/chat.module";

export class App {
  private app: Application;

  constructor(private readonly rabbitClient: RabbitMQClient) {
    this.app = express();
    this.setupMiddleware();
    this.setupRoutes();
    this.setupErrorHandling();
  }

  private setupMiddleware() {
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));
    this.app.use(morgan("dev"));
    this.app.use(
      helmet({
        contentSecurityPolicy: false,
        crossOriginEmbedderPolicy: false,
        crossOriginResourcePolicy: false,
      })
    );
    this.app.use(
      cors({
        origin: process.env.CLIENT_URL || "*",
        methods: ["GET", "POST", "PUT", "DELETE"],
      })
    );
  }

  private setupRoutes() {
    const userModule = new UserModule(this.rabbitClient);
    this.app.use("/api/users", userModule.createRouter());

    const chatRoomModule = new ChatRoomModule(this.rabbitClient);
    this.app.use("/api/chat-rooms", chatRoomModule.createRouter());

    const chatModule = new ChatModule(this.rabbitClient);
    this.app.use("/api/chats", chatModule.createRouter());
  }

  private setupErrorHandling() {
    this.app.use(handleSyntaxError as ErrorRequestHandler);
    this.app.use(notFound);
    this.app.use(errorHandler as ErrorRequestHandler);
  }

  public getApp(): Application {
    return this.app;
  }
}

