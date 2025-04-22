import {
  BadRequestException,
  Body,
  Controller,
  Post,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { Response } from 'express';

import { SignInDto, SignUpDto } from './auth.dto';
import { UserService } from '../user/user.service';
import { HashService } from '../common/hash/hash.service';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
    private readonly hashService: HashService,
  ) {}

  @Post('sign-up')
  async signUp(@Body() dto: SignUpDto, @Res() res: Response) {
    try {
      const user = await this.userService.findOneLean({
        email: dto.email.toLowerCase(),
      });

      if (user) {
        throw new UnauthorizedException({
          success: false,
          message: 'This Email is linked with another account',
        });
      }

      const createdUser = await this.userService.createUser(dto);
      const authToken = await this.authService.generateAuthToken(
        String(createdUser._id),
      );
      res.cookie('token', authToken, this.authService.getTokenCookieOptions());
      res.json({ success: true, message: `Welcome Back ${createdUser.name}` });
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }

      throw new BadRequestException({
        success: false,
        message: 'Failed to sign up',
      });
    }
  }

  @Post('sign-in')
  async signIn(@Body() dto: SignInDto, @Res() res: Response) {
    try {
      const user = await this.userService.findOneLeanWithPass({
        email: dto.email.toLowerCase(),
      });

      if (
        !user ||
        !(await this.hashService.compare(dto.password, user.password!))
      ) {
        throw new UnauthorizedException({
          success: false,
          message: 'Invalid credentials',
        });
      }

      const authToken = await this.authService.generateAuthToken(
        String(user._id),
      );
      res.cookie('token', authToken, this.authService.getTokenCookieOptions());
      res.json({ success: true, message: `Welcome Back ${user.name}` });
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }

      throw new BadRequestException({
        success: false,
        message: 'Failed to sign in',
      });
    }
  }

  @Post('sign-out')
  @UseGuards(JwtAuthGuard)
  signOut(@Res() res: Response) {
    try {
      res.clearCookie('token');
      res.json({ success: true, message: 'Signed out successfully' });
    } catch (error) {
      throw new BadRequestException({
        success: false,
        message: 'Failed to sign out',
      });
    }
  }
}
