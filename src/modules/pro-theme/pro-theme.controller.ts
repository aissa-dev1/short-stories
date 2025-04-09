import { Controller, Get, UseGuards } from '@nestjs/common';

import { ProThemeService } from './pro-theme.service';
import { ProGuard } from 'src/common/guards/pro.guard';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';

@Controller('pro-themes')
export class ProThemeController {
  constructor(private readonly proThemeService: ProThemeService) {}

  @Get()
  @UseGuards(JwtAuthGuard, ProGuard)
  getAll() {
    return this.proThemeService.readThemes();
  }
}
