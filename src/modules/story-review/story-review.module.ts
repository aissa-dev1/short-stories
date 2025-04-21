import { Module } from '@nestjs/common';

import { StoryReviewController } from './story-review.controller';
import { StoryReviewService } from './story-review.service';

@Module({
  controllers: [StoryReviewController],
  providers: [StoryReviewService],
})
export class StoryReviewModule {}
