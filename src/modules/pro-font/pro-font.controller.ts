import { Controller, Get, UseGuards } from '@nestjs/common';

import { ProFontService } from './pro-font.service';
import { ProGuard } from 'src/common/guards/pro.guard';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';

@Controller('pro-fonts')
export class ProFontController {
  constructor(private readonly proFontService: ProFontService) {}

  @Get()
  @UseGuards(JwtAuthGuard, ProGuard)
  getAll() {
    return this.proFontService.readFonts();
  }
}
