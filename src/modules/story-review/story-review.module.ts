import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { StoryReviewController } from './story-review.controller';
import { StoryReviewService } from './story-review.service';
import { StoryReview, StoryReviewSchema } from './story-review.model';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: StoryReview.name,
        schema: StoryReviewSchema,
      },
    ]),
  ],
  controllers: [StoryReviewController],
  providers: [StoryReviewService],
})
export class StoryReviewModule {}
