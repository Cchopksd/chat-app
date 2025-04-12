// src/services/UserService.ts
import { CreateUserDTO } from "../dtos/create-user.dto";
import { IUser } from "../models/User";
import { UserRepository } from "../repositories/user.repo";

export class UserService {
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

