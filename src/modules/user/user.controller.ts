import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Post,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';

import { UserService } from './user.service';
import { ChangePasswordDto, EditEmailDto, EditNameDto } from './user.dto';
import { HashService } from '../common/hash/hash.service';
import { CurrentUserType } from './user.types';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { CurrentUser } from './decorators/current-user.decorator';

@Controller('users')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly hashService: HashService,
  ) {}

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  async getProfile(@CurrentUser() currentUser: CurrentUserType) {
    const user = await this.userService.findOneLean({
      _id: currentUser.id,
    });

    if (!user) {
      throw new NotFoundException('No user found');
    }

    return user;
  }

  @Get('status')
  @UseGuards(JwtAuthGuard)
  async getStatus(@CurrentUser() currentUser: CurrentUserType) {
    const user = await this.userService.findOneLean({
      _id: currentUser.id,
    });

    if (!user) {
      throw new NotFoundException('No user found');
    }

    return { plan: user.plan, role: user.role };
  }

  @Post('edit-name')
  @UseGuards(JwtAuthGuard)
  async editName(
    @CurrentUser() currentUser: CurrentUserType,
    @Body() dto: EditNameDto,
  ) {
    const user = await this.userService.findOneLean({
      _id: currentUser.id,
    });

    if (!user) {
      throw new NotFoundException('No user found');
    }
    if (user.name === dto.name) {
      return { message: 'This is already your current name' };
    }

    await this.userService.updateUser(currentUser.id, {
      name: dto.name,
    });
    return { message: 'Your name have been edited successfully' };
  }

  @Post('edit-email')
  @UseGuards(JwtAuthGuard)
  async editEmail(
    @Body() dto: EditEmailDto,
    @CurrentUser() currentUser: CurrentUserType,
  ) {
    const user = await this.userService.findOneLean({
      _id: currentUser.id,
    });

    if (!user) {
      throw new NotFoundException('No user found');
    }
    if (user.email !== dto.currentEmail) {
      throw new UnauthorizedException('Incorrect email address');
    }
    if (user.email === dto.newEmail) {
      return { message: 'This is your current email' };
    }

    const userWithEmail = await this.userService.findOneLean({
      email: dto.newEmail,
    });

    if (userWithEmail) {
      throw new UnauthorizedException(
        'This email is already linked with another Account',
      );
    }

    await this.userService.updateUser(currentUser.id, {
      email: dto.newEmail,
    });
    return { message: 'Your email have been edited successfully' };
  }

  @Post('change-password')
  @UseGuards(JwtAuthGuard)
  async changePassword(
    @Body() dto: ChangePasswordDto,
    @CurrentUser() currentUser: CurrentUserType,
  ) {
    const user = await this.userService.findOneLeanWithPass({
      _id: currentUser.id,
    });

    if (!user) {
      throw new NotFoundException('No user found');
    }
    if (
      !(await this.hashService.compare(dto.currentPassword, user.password!))
    ) {
      throw new UnauthorizedException('Incorrect password');
    }
    if (await this.hashService.compare(dto.newPassword, user.password!)) {
      return { message: 'This is your current password' };
    }

    await this.userService.updateUser(currentUser.id, {
      password: await this.hashService.hash(dto.newPassword),
    });
    return { message: 'Your password have been edited successfully' };
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async deleteOne(
    @Param('id') id: string,
    @CurrentUser() currentUser: CurrentUserType,
  ) {
    const user = await this.userService.findOneLean({
      _id: currentUser.id,
    });

    if (!user) {
      throw new NotFoundException('No user found');
    }
    if (id !== currentUser.id) {
      throw new UnauthorizedException(
        'You are not allowed to delete this account',
      );
    }

    await this.userService.deleteUser(currentUser.id);
    return { message: 'Your account have been deleted successfully' };
  }
}
