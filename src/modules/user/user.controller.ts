import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Post,
  Req,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';

import { UserJwtType } from './user.types';
import { UserService } from './user.service';
import { ChangePasswordDto, EditEmailDto, EditNameDto } from './user.dto';
import { HashService } from '../common/hash/hash.service';

@Controller('users')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly hashService: HashService,
  ) {}

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

  @Post('edit-email')
  @UseGuards(AuthGuard('jwt'))
  async editEmail(@Body() dto: EditEmailDto, @Req() req: Request) {
    const userId = (req.user as UserJwtType).id;
    const user = await this.userService.findOneLeanById(userId);

    if (!user) {
      throw new NotFoundException('No user found');
    }
    if (user.email !== dto.currentEmail) {
      throw new UnauthorizedException('Incorrect Email Address');
    }
    if (user.email === dto.newEmail) {
      return { message: 'This is your current Email' };
    }

    const userWithEmail = await this.userService.findOneLeanByEmail(
      dto.newEmail,
    );

    if (userWithEmail) {
      throw new UnauthorizedException(
        'This Email is already linked with another Account',
      );
    }

    await this.userService.updateUser(userId, {
      email: dto.newEmail,
    });
    return { message: 'Your Email have been edited successfully' };
  }

  @Post('change-password')
  @UseGuards(AuthGuard('jwt'))
  async changePassword(@Body() dto: ChangePasswordDto, @Req() req: Request) {
    const userId = (req.user as UserJwtType).id;
    const user = await this.userService.findOneLeanByIdWithPass(userId);

    if (!user) {
      throw new NotFoundException('No user found');
    }
    if (
      !(await this.hashService.compare(dto.currentPassword, user.password!))
    ) {
      throw new UnauthorizedException('Incorrect Password');
    }
    if (await this.hashService.compare(dto.newPassword, user.password!)) {
      return { message: 'This is your current Password' };
    }

    await this.userService.updateUser(userId, {
      password: await this.hashService.hash(dto.newPassword),
    });
    return { message: 'Your Password have been edited successfully' };
  }
}
