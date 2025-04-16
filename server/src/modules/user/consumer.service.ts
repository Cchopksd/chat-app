import { RabbitMQClient } from "../../shared/rabbitmq/RabbitMQClient";
import { UserService } from "./user.service";
import { UserRPCConsumer } from "./user.consumer";

export class UserConsumerService {
  constructor(
    private readonly rabbitClient: RabbitMQClient,
    private readonly userService: UserService
  ) {}

  public async initializeConsumers(): Promise<void> {
    const consumers = [
      new UserRPCConsumer(this.rabbitClient, this.userService),
    ];

    await Promise.all(consumers.map((c) => c.init()));
  }
}
