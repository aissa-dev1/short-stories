import {
  Controller,
  Get,
  Req,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';

import { ProThemeService } from './pro-theme.service';
import { UserJwtType } from '../user/user.types';
import { UserService } from '../user/user.service';

@Controller('pro-themes')
export class ProThemeController {
  constructor(
    private readonly proThemeService: ProThemeService,
    private readonly userService: UserService,
  ) {}

  @Get()
  @UseGuards(AuthGuard('jwt'))
  async getAll(@Req() req: Request) {
    const userId = (req.user as UserJwtType).id;
    const user = await this.userService.findOneLeanById(userId);

    if (!user || user.plan !== 'pro') {
      throw new UnauthorizedException();
    }

    return this.proThemeService.readThemes();
  }

  @Get('names')
  @UseGuards(AuthGuard('jwt'))
  async getNames(@Req() req: Request) {
    const themes = await this.getAll(req);
    return Object.keys(themes);
  }
}
