import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { StoryController } from './story.controller';
import { StoryService } from './story.service';
import { Story, StorySchema } from './story.model';
import { UserModule } from '../user/user.module';
import { UserAdminGuard } from '../user/guards/user-admin.guard';
import { StoryContentModule } from '../story-content/story-content.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Story.name, schema: StorySchema }]),
    UserModule,
    StoryContentModule,
  ],
  controllers: [StoryController],
  providers: [StoryService, UserAdminGuard],
})
export class StoryModule {}
