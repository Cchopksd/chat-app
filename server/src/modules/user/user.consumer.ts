// UserRPCConsumer.ts
import { HydratedDocument } from "mongoose";
import { RabbitMQClient } from "../../shared/rabbitmq/RabbitMQClient";
import { QUEUE_NAMES } from "../../shared/rabbitmq/queues";
import { IUser } from "./user.model";
import { IUserService, UserService } from "./user.service";

export interface RpcResponse<T> {
  data: T | null;
}

export class UserRPCConsumer {
  constructor(
    private readonly client: RabbitMQClient,
    private readonly userService: IUserService
  ) {}

  public async init(): Promise<void> {
    await this.registerGetUserHandler();
  }

  private async registerGetUserHandler(): Promise<void> {
    await this.client.consume(
      QUEUE_NAMES.USER.GET_USER,
      this.handleGetUser.bind(this)
    );

    await this.client.consume(
      QUEUE_NAMES.USER.GET_BY_EMAIL,
      this.handleGetUserByEmail.bind(this)
    );
  }

  private async handleGetUser(payload: any): Promise<RpcResponse<any>> {
    const user = await this.userService.findByUserInfo(payload);
    return { data: user };
  }

  private async handleGetUserByEmail(
    payload: any
  ): Promise<HydratedDocument<IUser> | null> {
    const user = await this.userService.findUserByEmail(payload.email);
    return user as HydratedDocument<IUser> | null;
  }
}

