import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { StoryController } from './story.controller';
import { StoryService } from './story.service';
import { Story, StorySchema } from './story.model';
import { UserModule } from '../user/user.module';
import { UserAdminGuard } from '../user/guards/user-admin.guard';
import { StoryContentModule } from '../story-content/story-content.module';
import { StoryReviewModule } from '../story-review/story-review.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Story.name, schema: StorySchema }]),
    UserModule,
    StoryContentModule,
    forwardRef(() => StoryReviewModule),
  ],
  controllers: [StoryController],
  providers: [StoryService, UserAdminGuard],
  exports: [StoryService],
})
export class StoryModule {}
