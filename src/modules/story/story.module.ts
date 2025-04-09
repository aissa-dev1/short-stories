import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { StoryController } from './story.controller';
import { StoryService } from './story.service';
import { Story, StorySchema } from './story.model';
import { UserModule } from '../user/user.module';
import { AdminGuard } from 'src/common/guards/admin.guard';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Story.name, schema: StorySchema }]),
    UserModule,
  ],
  controllers: [StoryController],
  providers: [StoryService, AdminGuard],
})
export class StoryModule {}
