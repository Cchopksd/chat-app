import { Request, Response } from "express";
import { IUserService } from "../services/user.service";
import { CreateUserSchema, CreateUserDTO } from "../dtos/create-user.dto";
import {
  BadRequestException,
  successResponse,
} from "../utils/exceptions/http.exception";

export class UserController {
  constructor(private readonly userService: IUserService) {}

  public async createUser(req: Request, res: Response): Promise<void> {
    const user = await this.userService.createUser(req.body as CreateUserDTO);
    successResponse(res, user, "User created successfully");
  }

  public async findByUserInfo(req: Request, res: Response): Promise<void> {
    const { email, name } = req.query;
    const user = await this.userService.findByUserInfo({
      email: email as string | undefined,
      name: name as string | undefined,
    });

    successResponse(res, user, "User retrieved successfully");
  }

  public async getAllUsers(_req: Request, res: Response): Promise<void> {
    const users = await this.userService.getAllUsers();
    successResponse(res, users, "Users retrieved successfully");
  }
}

