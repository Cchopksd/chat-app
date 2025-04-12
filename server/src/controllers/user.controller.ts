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
    const validationResult = CreateUserSchema.safeParse(req.body);

    if (!validationResult.success) {
      const errors = validationResult.error.errors.map((err) => ({
        field: err.path.join("."),
        message: err.message,
      }));

      throw new BadRequestException("Validation Failed", errors);
    }

    try {
      const user = await this.userService.createUser(validationResult.data);
      successResponse(res, user, "User created successfully");
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  }

  public async getAllUsers(_req: Request, res: Response): Promise<void> {
    const users = await this.userService.getAllUsers();
    successResponse(res, users, "Users retrieved successfully");
  }
}

