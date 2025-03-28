import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';

import { UserJwtType } from './user.types';
import { UserService } from './user.service';
import { EditNameDto } from './user.dto';

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

  @Post('edit-name')
  @UseGuards(AuthGuard('jwt'))
  async editName(@Body() dto: EditNameDto, @Req() req: Request) {
    const userId = (req.user as UserJwtType).id;
    const user = await this.userService.findOneLeanById(userId);

    if (!user) {
      throw new NotFoundException('No user found');
    }
    if (user.name === dto.name) {
      return { message: 'This is already your current Name' };
    }

    await this.userService.updateUser(userId, {
      name: dto.name,
    });
    return { message: 'Your Name have been edited successfully' };
  }
}
