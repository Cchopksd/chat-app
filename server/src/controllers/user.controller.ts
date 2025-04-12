import { Request, Response } from "express";
import { UserService } from "../services/user.service";
import { CreateUserSchema, CreateUserDTO } from "../dtos/create-user.dto";

export class UserController {
  constructor(private readonly userService: UserService) {}

  public async createUser(req: Request, res: Response): Promise<void> {
    const validationResult = CreateUserSchema.safeParse(req.body);

    if (!validationResult.success) {
      res.status(400).json({
        success: false,
        errors: validationResult.error.errors,
      });
      return;
    }

    try {
      const user = await this.userService.createUser(validationResult.data);
      res.status(201).json(user);
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  }

  public async getAllUsers(_req: Request, res: Response): Promise<void> {
    const users = await this.userService.getAllUsers();
    res.json(users);
  }
}

