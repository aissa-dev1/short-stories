import {
  BadRequestException,
  Controller,
  Get,
  NotFoundException,
  Param,
} from '@nestjs/common';
import { isValidObjectId } from 'mongoose';

import { StoryContentService } from './story-content.service';

@Controller('story-contents')
export class StoryContentController {
  constructor(private readonly storyContentService: StoryContentService) {}

  @Get(':storyId')
  async findOneByStoryId(@Param('storyId') storyId: string) {
    if (!isValidObjectId(storyId)) {
      throw new BadRequestException({
        success: false,
        message: 'Invalid story ID format',
      });
    }

    try {
      const storyContent = await this.storyContentService.findOneLean({
        storyId,
      });

      if (!storyContent) {
        throw new NotFoundException({
          success: false,
          message: 'Story content not found',
        });
      }

      return {
        success: true,
        data: storyContent,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }

      throw new BadRequestException({
        success: false,
        message: 'Failed to fetch story content',
      });
    }
  }
}
