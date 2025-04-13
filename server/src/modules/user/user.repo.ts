import { UserModel, IUser } from "./user";

export interface IUserRepository {
  create(user: IUser): Promise<IUser>;
  findAll(): Promise<IUser[]>;
  findByEmail(email: string): Promise<IUser | null>;
  findByUserInfo(email?: string, name?: string): Promise<IUser[] | null>;
}

export class UserRepository implements IUserRepository {
  async create(data: Partial<IUser>): Promise<IUser> {
    const user = new UserModel(data);
    return user.save();
  }

  async findAll(): Promise<IUser[]> {
    return UserModel.find().exec();
  }

  async findByEmail(email: string): Promise<IUser | null> {
    return UserModel.findOne({ email }).exec();
  }

  async findByUserInfo(email?: string, name?: string): Promise<IUser[] | null> {
    const filters: any = {};

    if (email) {
      filters.email = { $regex: new RegExp(email, "i") };
    }

    if (name) {
      filters.name = { $regex: new RegExp(name, "i") };
    }

    return UserModel.find(filters).exec();
  }
}

