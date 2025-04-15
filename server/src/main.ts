// src/main.ts
import http from "http";
import dotenv from "dotenv";
dotenv.config();

import { connectToDatabase } from "./configs/database";
import { RabbitMQService } from "./configs/rabbitmq.connection";
import { WebSocketGateway } from "./sockets/gateway";
import { App } from "./configs/app";

import { UserModule } from "./modules/user/user.module";

const PORT = process.env.PORT || 5000;
const ENV = process.env.NODE_ENV || "development";

async function bootstrap() {
  try {
    await connectToDatabase();

    const rabbitService = new RabbitMQService(
      process.env.RABBITMQ_URI || "amqp://localhost"
    );
    await rabbitService.connect();

    const rabbitClient = rabbitService.getClient();

    const userModule = new UserModule(rabbitClient);
    await userModule.initializeConsumers();

    const appInstance = new App(rabbitClient);
    const server = http.createServer(appInstance.getApp());

    const wsGateway = new WebSocketGateway(server);
    wsGateway.start();

    server.listen(PORT, () => {
      console.log(`🚀 Server started on port ${PORT} [${ENV}]`);
    });

    process.on("SIGINT", async () => {
      console.log("👋 Gracefully shutting down...");
      await rabbitService.close();
      process.exit(0);
    });

  } catch (error) {
    console.error("❌ Error during bootstrap process:", error);
    process.exit(1);
  }
}

bootstrap();

