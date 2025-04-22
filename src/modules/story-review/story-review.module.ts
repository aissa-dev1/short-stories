import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { StoryReviewController } from './story-review.controller';
import { StoryReviewService } from './story-review.service';
import { StoryReview, StoryReviewSchema } from './story-review.model';
import { UserModule } from '../user/user.module';
import { StoryModule } from '../story/story.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: StoryReview.name,
        schema: StoryReviewSchema,
      },
    ]),
    UserModule,
    forwardRef(() => StoryModule),
  ],
  controllers: [StoryReviewController],
  providers: [StoryReviewService],
  exports: [StoryReviewService],
})
export class StoryReviewModule {}
