import { HydratedDocument } from "mongoose";
import { QUEUE_NAMES } from "../../shared/rabbitmq/queues";
import { RabbitMQClient } from "../../shared/rabbitmq/RabbitMQClient";
import { LoginDTO } from "./dtos/login.dto";
import { comparePassword } from "../../shared/utils/hashing";
import { BadRequestException } from "../../shared/exceptions/http.exception";
import { Token } from "../../shared/utils/token";

export interface IAuthService {
  login<T extends { accessToken: string }>(data: LoginDTO): Promise<T>;
}

interface User {
  _id: string;
  name: string;
  email: string;
  password: string;
}

export class AuthService implements IAuthService {
  constructor(private readonly rabbitClient: RabbitMQClient) {}

  public async login<T>(data: LoginDTO): Promise<T> {
    const existUser = (await this.rabbitClient.sendRPC<T>(
      QUEUE_NAMES.USER.GET_BY_EMAIL,
      { email: data.email }
    )) as User;
    if (!existUser) {
      throw new BadRequestException("Email or Password is incorrect");
    }

    const isMatched = await comparePassword({
      password: data.password,
      hash: existUser.password,
    });

    if (!isMatched) {
      throw new BadRequestException("Email or Password is incorrect");
    }

    const accessToken = Token.generateAccessToken({
      user_id: existUser._id,
      email: existUser.email,
      name: existUser.name,
    });

    return { accessToken } as T;
  }
}

