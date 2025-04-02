import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Post,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Request, Response } from 'express';
import jsPDF from 'jspdf';

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
      return { message: 'This is already your current name' };
    }

    await this.userService.updateUser(userId, {
      name: dto.name,
    });
    return { message: 'Your name have been edited successfully' };
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
      throw new UnauthorizedException('Incorrect email address');
    }
    if (user.email === dto.newEmail) {
      return { message: 'This is your current email' };
    }

    const userWithEmail = await this.userService.findOneLeanByEmail(
      dto.newEmail,
    );

    if (userWithEmail) {
      throw new UnauthorizedException(
        'This email is already linked with another Account',
      );
    }

    await this.userService.updateUser(userId, {
      email: dto.newEmail,
    });
    return { message: 'Your email have been edited successfully' };
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
      throw new UnauthorizedException('Incorrect password');
    }
    if (await this.hashService.compare(dto.newPassword, user.password!)) {
      return { message: 'This is your current password' };
    }

    await this.userService.updateUser(userId, {
      password: await this.hashService.hash(dto.newPassword),
    });
    return { message: 'Your password have been edited successfully' };
  }

  // TODO: This needs to be deleted
  @Post('generate-pdf')
  @UseGuards(AuthGuard('jwt'))
  async getPdf(@Req() req: Request, @Res() res: Response) {
    const userId = (req.user as UserJwtType).id;
    const user = await this.userService.findOneLeanById(userId);

    if (!user) {
      throw new NotFoundException('No user found');
    }

    const doc = new jsPDF();

    doc.text(`Hello ${user.name}`, 10, 10);

    const pdfBuffer = Buffer.from(doc.output('arraybuffer'));

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'attachment; filename=example.pdf',
      'Content-Length': pdfBuffer.length,
    });

    res.end(pdfBuffer);
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'))
  async deleteOne(@Param('id') id: string, @Req() req: Request) {
    const userId = (req.user as UserJwtType).id;
    const user = await this.userService.findOneLeanById(userId);

    if (!user) {
      throw new NotFoundException('No user found');
    }
    if (id !== userId) {
      throw new UnauthorizedException(
        'You are not allowed to delete this account',
      );
    }

    await this.userService.deleteUser(userId);
    return { message: 'Your account have been deleted successfully' };
  }
}
