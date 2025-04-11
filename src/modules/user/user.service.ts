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

  async findOneLean(filter: Partial<UserType> = {}): Promise<UserType | null> {
    return this.userModel.findOne(filter).lean<UserType>().exec();
  }

  async findOneLeanWithPass(
    filter: Partial<UserType> = {},
  ): Promise<UserType | null> {
    return this.userModel
      .findOne(filter)
      .select('+password')
      .lean<UserType>()
      .exec();
  }

  async createUser(dto: CreateUserDto): Promise<User> {
    const user = await this.userModel.create({
      name: dto.name || this.generateUserName(dto.email),
      email: dto.email.toLowerCase(),
      password: await this.hashService.hash(dto.password),
    });
    await user.save();
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
