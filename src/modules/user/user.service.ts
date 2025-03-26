import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { User } from './user.model';
import { CreateUserDto } from './user.dto';
import { HashService } from '../common/hash/hash.service';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
    private readonly hashService: HashService,
  ) {}

  async createUser(dto: CreateUserDto) {
    const user = await this.userModel.create({
      name: this.generateUserName(dto.email),
      email: dto.email,
      password: await this.hashService.hash(dto.password),
    });
    await user.save();
  }

  private generateUserName(email: string): string {
    return email.split('@')[0] || 'Anonymous';
  }
}
