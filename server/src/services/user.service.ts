import { CreateUserDTO } from "../dtos/create-user.dto";
import { IUser } from "../models/user";
import { UserRepository } from "../repositories/user.repo";
import {
  ConflictException,
  NotFoundException,
} from "../utils/exceptions/http.exception";
import { hashPassword } from "../utils/hashing";

export interface IUserService {
  createUser(data: CreateUserDTO): Promise<IUser>;
  getAllUsers(): Promise<IUser[]>;
  findByUserInfo(data: { email?: string; name?: string }): Promise<IUser[]>;
}

export class UserService implements IUserService {
  constructor(private readonly userRepository: UserRepository) {}

  public async createUser(data: CreateUserDTO): Promise<IUser> {
    const existingUser = await this.userRepository.findByEmail(data.email);
    if (existingUser) {
      throw new ConflictException("User already exists");
    }

    const hashedPassword = await hashPassword(data.password);

    const newUser = await this.userRepository.create({
      ...data,
      password: hashedPassword,
    });

    return newUser;
  }

  public async findByUserInfo(data: {
    email?: string;
    name?: string;
  }): Promise<IUser[]> {
    const user = await this.userRepository.findByUserInfo(
      data.email,
      data.name
    );
    if (!user || user.length <= 0)
      throw new NotFoundException("User not found");

    return user;
  }

  public async getAllUsers(): Promise<IUser[]> {
    return this.userRepository.findAll();
  }
}

