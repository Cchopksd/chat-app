import { RabbitMQClient } from "../../shared/rabbitmq/RabbitMQClient";
import { QUEUE_NAMES } from "../../shared/rabbitmq/queues";
import { UserService } from "./user.service";

export interface RpcResponse<T> {
  data: T | null;
  error: {
    message: string;
    statusCode: number;
  } | null;
}

export async function initUserRPCConsumer(
  client: RabbitMQClient,
  userService: UserService
) {
  await client.consume(
    QUEUE_NAMES.USER.GET_USER,
    async (payload): Promise<RpcResponse<any>> => {
      const user = await userService.findByUserInfo(payload);
      return {
        data: user,
        error: null,
      };
    }
  );
}

