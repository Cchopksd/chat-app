// src/services/UserService.ts
import { CreateUserDTO } from "../dtos/create-user.dto";
import { IUser } from "../models/user";
import { UserRepository } from "../repositories/user.repo";

export interface IUserService {
  createUser(data: Partial<IUser>): Promise<IUser>;
  getAllUsers(): Promise<IUser[]>;
}

export class UserService implements IUserService {
  constructor(private readonly userRepository: UserRepository) {}

  public async createUser(createUserDTO: CreateUserDTO): Promise<any> {
    const { name, email } = createUserDTO;
    const newUser = await this.userRepository.create({ name, email });

    return newUser;
  }

  async getAllUsers(): Promise<IUser[]> {
    return this.userRepository.findAll();
  }
}

