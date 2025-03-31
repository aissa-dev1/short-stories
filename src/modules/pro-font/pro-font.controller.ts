import {
  Controller,
  Get,
  Req,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';

import { ProFontService } from './pro-font.service';
import { UserService } from '../user/user.service';
import { UserJwtType } from '../user/user.types';

@Controller('pro-fonts')
export class ProFontController {
  constructor(
    private readonly proFontService: ProFontService,
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

    return {
      src: this.proFontService.readFontsSrc(),
      ui: this.proFontService.readFonts('pro-ui-font-data.json'),
      reading: this.proFontService.readFonts('pro-reading-font-data.json'),
    };
  }
}
