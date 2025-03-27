import {
  Controller,
  Get,
  NotFoundException,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';

import { UserJwtType } from './user.types';
import { UserService } from './user.service';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('profile')
  @UseGuards(AuthGuard('jwt'))
  async getProfile(@Req() req: Request) {
    const userId = (req.user as UserJwtType).id;
    const user = await this.userService.findOneLeanById(userId);

    if (!user) {
      throw new NotFoundException('No user found');
    }

    return user;
  }

  @Get('status')
  @UseGuards(AuthGuard('jwt'))
  async getStatus(@Req() req: Request) {
    const userId = (req.user as UserJwtType).id;
    const user = await this.userService.findOneLeanById(userId);

    if (!user) {
      throw new NotFoundException('No user found');
    }

    return { plan: user.plan, role: user.role };
  }
}
