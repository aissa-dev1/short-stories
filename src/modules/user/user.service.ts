import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { User } from './user.model';
import { CreateUserDto } from './user.dto';
import { HashService } from '../common/hash/hash.service';
import { UserType } from './user.types';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
    private readonly hashService: HashService,
  ) {}

  async createUser(dto: CreateUserDto): Promise<User> {
    const user = await this.userModel.create({
      name: dto.name || this.generateUserName(dto.email),
      email: dto.email.toLowerCase(),
      password: await this.hashService.hash(dto.password),
    });
    await user.save();
    return user;
  }

  async findOneLeanByEmail(email: string): Promise<UserType | null> {
    const user = (await this.userModel
      .findOne({ email: email.toLowerCase() })
      .select('+password')
      .lean()) as UserType | null;
    return user;
  }

  async findOneLeanById(id: string): Promise<UserType | null> {
    const user = (await this.userModel.findById(id).lean()) as UserType | null;
    return user;
  }

  async findOneLeanByIdWithPass(id: string): Promise<UserType | null> {
    const user = (await this.userModel
      .findById(id)
      .select('+password')
      .lean()) as UserType | null;
    return user;
  }

  updateUser(id: string, update?: Partial<UserType>): Promise<User | null> {
    return this.userModel.findByIdAndUpdate(id, update, { new: true }).exec();
  }

  deleteUser(id: string): Promise<User | null> {
    return this.userModel.findByIdAndDelete(id).exec();
  }

  private generateUserName(email: string): string {
    return email.split('@')[0] || 'Anonymous';
  }
}
