import { Module } from '@nestjs/common';

import { ProThemeController } from './pro-theme.controller';
import { ProThemeService } from './pro-theme.service';
import { UserModule } from '../user/user.module';
import { ProGuard } from 'src/common/guards/pro.guard';

@Module({
  imports: [UserModule],
  controllers: [ProThemeController],
  providers: [ProThemeService, ProGuard],
})
export class ProThemeModule {}
