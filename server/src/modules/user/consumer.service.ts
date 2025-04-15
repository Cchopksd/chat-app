// src/modules/user/consumer.service.ts
import { RabbitMQClient } from "../../shared/rabbitmq/RabbitMQClient";
import { UserService } from "./user.service";
import { initUserRPCConsumer } from "./user.consumer";

export class ConsumerService {
  constructor(
    private readonly rabbitClient: RabbitMQClient,
    private readonly userService: UserService
  ) {}

  public async initializeConsumers(): Promise<void> {
    await initUserRPCConsumer(this.rabbitClient, this.userService);
    console.log("✅ User consumer initialized");
  }
}

