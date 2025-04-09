import { Module } from '@nestjs/common';

import { ProFontController } from './pro-font.controller';
import { ProFontService } from './pro-font.service';
import { UserModule } from '../user/user.module';
import { ProGuard } from 'src/common/guards/pro.guard';

@Module({
  imports: [UserModule],
  controllers: [ProFontController],
  providers: [ProFontService, ProGuard],
})
export class ProFontModule {}
