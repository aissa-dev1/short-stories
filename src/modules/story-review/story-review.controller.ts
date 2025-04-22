import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';

import { StoryReviewService } from './story-review.service';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { CurrentUser } from '../user/decorators/current-user.decorator';
import { CurrentUserType } from '../user/user.types';
import { CreateStoryReviewDto } from './story-review.dto';
import { UserService } from '../user/user.service';
import { StoryService } from '../story/story.service';
import { StoryReviewWithDetails } from './story-review.types';

@Controller('story-reviews')
export class StoryReviewController {
  constructor(
    private readonly storyReviewService: StoryReviewService,
    private readonly userService: UserService,
    private readonly storyService: StoryService,
  ) {}

  @Get(':storyId')
  async getStoryReviewsByStoryId(@Param('storyId') storyId: string) {
    try {
      let data: StoryReviewWithDetails[] = [];
      const [story, storyReviews] = await Promise.all([
        this.storyService.findOneLean({
          _id: storyId,
        }),
        this.storyReviewService.findAllLean({
          storyId,
        }),
      ]);

      for (const storyReview of storyReviews) {
        const user = await this.userService.findOneLean({
          _id: storyReview.userId,
        });

        data = [
          ...data,
          {
            ...storyReview,
            userName: user?.name || '',
            storyName: story?.name || '',
          },
        ];
      }

      return {
        success: true,
        data,
      };
    } catch (error) {
      throw new BadRequestException({
        success: false,
        message: 'Failed to get story reviews',
      });
    }
  }

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
