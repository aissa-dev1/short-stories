import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Patch,
  Post,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { isValidObjectId } from 'mongoose';

import { StoryReviewService } from './story-review.service';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { CurrentUser } from '../user/decorators/current-user.decorator';
import { CurrentUserType } from '../user/user.types';
import { CreateStoryReviewDto, EditStoryReviewDto } from './story-review.dto';
import { UserService } from '../user/user.service';
import { StoryService } from '../story/story.service';
import { StoryReviewWithDetails } from './story-review.types';
import { UserRole } from '../user/user.constants';

@Controller('story-reviews')
export class StoryReviewController {
  constructor(
    private readonly storyReviewService: StoryReviewService,
    private readonly userService: UserService,
    private readonly storyService: StoryService,
  ) {}

  @Get('story/:id')
  async getStoryReviewsByStoryId(@Param('id') id: string) {
    try {
      let data: StoryReviewWithDetails[] = [];
      const [story, storyReviews] = await Promise.all([
        this.storyService.findOneLean({
          _id: id,
        }),
        this.storyReviewService.findAllLean({
          storyId: id,
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
            storySlug: story?.slug || '',
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

  @Get(':id')
  async getStoryReviewById(@Param('id') id: string) {
    try {
      const [story, storyReview] = await Promise.all([
        this.storyService.findOneLean({
          _id: id,
        }),
        this.storyReviewService.findOneLean({
          storyId: id,
        }),
      ]);
      const user = await this.userService.findOneLean({
        _id: storyReview?.userId,
      });

      return {
        success: true,
        data: {
          ...storyReview,
          userName: user?.name || '',
          storyName: story?.name || '',
          storySlug: story?.slug || '',
        },
      };
    } catch (error) {
      throw new BadRequestException({
        success: false,
        message: 'Failed to get story review',
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

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  async editStoryReview(
    @CurrentUser() currentUser: CurrentUserType,
    @Param('id') id: string,
    @Body() dto: EditStoryReviewDto,
  ) {
    if (!isValidObjectId(id)) {
      throw new BadRequestException({
        success: false,
        message: 'Invalid story review ID format',
      });
    }

    try {
      const storyReview = await this.storyReviewService.findOneLean({
        _id: id,
      });

      if (!storyReview) {
        throw new NotFoundException({
          success: false,
          message: 'Story review not found',
        });
      }
      if (String(storyReview.userId) !== currentUser.id) {
        throw new UnauthorizedException({
          success: false,
          message: `you don't have permission to edit this review`,
        });
      }
      if (
        storyReview.stars === dto.stars &&
        storyReview.comment === dto.comment
      ) {
        return {
          success: true,
          message: 'Your review have been edited successfully',
        };
      }

      await this.storyReviewService.updateStoryReview(id, dto);
      return {
        success: true,
        message: 'Your review have been edited successfully',
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }

      throw new BadRequestException({
        success: false,
        message: 'Failed to edit your review',
      });
    }
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async deleteStoryReview(
    @CurrentUser() currentUser: CurrentUserType,
    @Param('id') id: string,
  ) {
    if (!isValidObjectId(id)) {
      throw new BadRequestException({
        success: false,
        message: 'Invalid story review ID format',
      });
    }

    try {
      const [user, storyReview] = await Promise.all([
        this.userService.findOneLean({ _id: currentUser.id }),
        this.storyReviewService.findOneLean({ _id: id }),
      ]);

      if (!storyReview) {
        throw new NotFoundException({
          success: false,
          message: 'Story review not found',
        });
      }
      if (
        user?.role !== UserRole.Admin &&
        String(storyReview.userId) !== currentUser.id
      ) {
        throw new UnauthorizedException({
          success: false,
          message: `you don't have permission to delete this review`,
        });
      }

      await this.storyReviewService.deleteOne({
        _id: id,
      });
      return {
        success: true,
        message: 'Story review have been deleted successfully',
      };
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof UnauthorizedException
      ) {
        throw error;
      }

      throw new BadRequestException({
        success: false,
        message: 'Failed to delete story review',
      });
    }
  }
}
