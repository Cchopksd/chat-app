import { CreateUserDTO } from "./dtos/create-user.dto";
import { IUser } from "./user.model";
import { UserRepository } from "./user.repo";
import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from "../../shared/exceptions/http.exception";
import { hashPassword } from "../../shared/utils/hashing";

export interface IUserService {
  createUser(data: CreateUserDTO): Promise<IUser>;
  getAllUsers(): Promise<IUser[]>;
  findUserByID(id: string): Promise<IUser | null>;
  findUserByEmail(email: string): Promise<IUser | null>;
  findByUserInfo(data: {
    email?: string;
    name?: string;
    withUser: string;
  }): Promise<IUser[] | []>;
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

  public async findUserByID(id: string): Promise<IUser | null> {
    const user = await this.userRepository.findUserByID(id);
    if (!user) {
      throw new BadRequestException("User not found");
    }
    return user;
  }

  public async findUserByEmail(email: string): Promise<IUser | null> {
    const user = await this.userRepository.findByEmail(email);

    return user;
  }

  public async findByUserInfo(data: {
    email?: string;
    name?: string;
    withUser: string;
  }): Promise<IUser[] | []> {
    const user = await this.userRepository.findByUserInfo(
      data.email,
      data.name
    );
    if (!user || user.length <= 0) {
      return [];
    }

    return user;
  }

  public async getAllUsers(): Promise<IUser[]> {
    return this.userRepository.findAll();
  }
}

