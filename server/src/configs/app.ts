import express, { Application, ErrorRequestHandler } from "express";
import morgan from "morgan";
import helmet from "helmet";
import cors from "cors";
import cookieParser from "cookie-parser";

import { UserModule } from "../modules/user/user.module";

import { ChatRoomModule } from "../modules/room/room.module";
import { RabbitMQClient } from "../shared/rabbitmq/RabbitMQClient";
import { ErrorMiddleware } from "../shared/middlewares/error.middleware";

import { ChatModule } from "../modules/chat/chat.module";
import { AuthModule } from "../modules/auth/auth.module";

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
    this.app.use(cookieParser());
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
        credentials: true,
      })
    );
  }

  private setupRoutes() {
    const userModule = new UserModule(this.rabbitClient);
    this.app.use("/api/users", userModule.createRouter());

    const authModule = new AuthModule(this.rabbitClient);
    this.app.use("/api/auth", authModule.createRouter());

    const chatRoomModule = new ChatRoomModule(this.rabbitClient);
    this.app.use("/api/chat-rooms", chatRoomModule.createRouter());

    const chatModule = new ChatModule(this.rabbitClient);
    this.app.use("/api/chats", chatModule.createRouter());
  }

  private setupErrorHandling() {
    this.app.use(ErrorMiddleware.handleSyntaxError as ErrorRequestHandler);
    this.app.use(ErrorMiddleware.handleNotFound);
    this.app.use(ErrorMiddleware.handleError as ErrorRequestHandler);
  }

  public getApp(): Application {
    return this.app;
  }
}

