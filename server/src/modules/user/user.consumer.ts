// UserRPCConsumer.ts
import { RabbitMQClient } from "../../shared/rabbitmq/RabbitMQClient";
import { QUEUE_NAMES } from "../../shared/rabbitmq/queues";
import { UserService } from "./user.service";

export interface RpcResponse<T> {
  data: T | null;
}

export class UserRPCConsumer {
  constructor(
    private readonly client: RabbitMQClient,
    private readonly userService: UserService
  ) {}

  public async init(): Promise<void> {
    await this.registerGetUserHandler();
  }

  private async registerGetUserHandler(): Promise<void> {
    await this.client.consume(
      QUEUE_NAMES.USER.GET_USER,
      this.handleGetUser.bind(this)
    );
  }

  private async handleGetUser(payload: any): Promise<RpcResponse<any>> {
    const user = await this.userService.findByUserInfo(payload);
    return { data: user };
  }
}

