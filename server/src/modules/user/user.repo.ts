import { UserModel, IUser } from "./user.model";

export interface IUserRepository {
  create(user: IUser): Promise<IUser>;
  findAll(): Promise<IUser[]>;
  findByEmail(email: string): Promise<IUser | null>;
  findUserByID(id: string): Promise<IUser | null>;
  findByUserInfo(email?: string, name?: string): Promise<IUser[] | null>;
}

export class UserRepository implements IUserRepository {
  public async create(data: Partial<IUser>): Promise<IUser> {
    const user = new UserModel(data);
    return user.save();
  }

  public async findAll(): Promise<IUser[]> {
    return UserModel.find().exec();
  }

  public async findByEmail(email: string): Promise<IUser | null> {
    return UserModel.findOne({ email }).exec();
  }

  public async findUserByID(id: string): Promise<IUser | null> {
    return UserModel.findById(id).exec();
  }

  public async findByUserInfo(
    email?: string,
    name?: string
  ): Promise<IUser[] | null> {
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

