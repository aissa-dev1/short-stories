import {
  BadRequestException,
  Body,
  Controller,
  Post,
  UseGuards,
} from '@nestjs/common';

import { StoryReviewService } from './story-review.service';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { CurrentUser } from '../user/decorators/current-user.decorator';
import { CurrentUserType } from '../user/user.types';
import { CreateStoryReviewDto } from './story-review.dto';

@Controller('story-reviews')
export class StoryReviewController {
  constructor(private readonly storyReviewService: StoryReviewService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async createStoryReview(
    @CurrentUser() currentUser: CurrentUserType,
    @Body() dto: CreateStoryReviewDto,
  ) {
    try {
      const storyReview = await this.storyReviewService.findOneLean({
        userId: currentUser.id,
        storyId: dto.storyId,
      });

      if (storyReview) {
        throw new BadRequestException({
          success: false,
          message: 'You have already posted a review on this story',
        });
      }

      await this.storyReviewService.createStoryReview(dto, currentUser.id);
      return {
        success: true,
        message: 'Your review have been posted successfully',
      };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }

      throw new BadRequestException({
        success: false,
        message: 'Failed to post your review',
      });
    }
  }
}
