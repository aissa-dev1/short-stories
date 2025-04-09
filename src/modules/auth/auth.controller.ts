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
    const user = await this.userService.findOneLeanByEmail(dto.email);

    if (user) {
      throw new UnauthorizedException(
        'This Email is linked with another account',
      );
    }
    if (typeof dto.name === 'string' && dto.name.length < 2) {
      throw new BadRequestException('This Name is too short');
    }

    const createdUser = await this.userService.createUser(dto);
    const authToken = await this.authService.generateAuthToken(
      String(createdUser._id),
    );
    res.cookie('token', authToken, this.authService.getTokenCookieOptions());
    res.json({ message: `Welcome Back ${createdUser.name}` });
  }

  @Post('sign-in')
  async signIn(@Body() dto: SignInDto, @Res() res: Response) {
    const user = await this.userService.findOneLeanByEmail(dto.email);

    if (
      !user ||
      !(await this.hashService.compare(dto.password, user.password!))
    ) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const authToken = await this.authService.generateAuthToken(
      String(user._id),
    );
    res.cookie('token', authToken, this.authService.getTokenCookieOptions());
    res.json({ message: `Welcome Back ${user.name}` });
  }

  @Post('sign-out')
  @UseGuards(JwtAuthGuard)
  signOut(@Res() res: Response) {
    res.clearCookie('token');
    res.json({ message: 'Signed out successfully' });
  }
}
