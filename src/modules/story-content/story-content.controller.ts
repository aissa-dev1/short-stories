import { BadRequestException, Controller, Get, Param } from '@nestjs/common';
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
      return {
        success: true,
        data: storyContent,
      };
    } catch (error) {
      throw new BadRequestException({
        success: false,
        message: 'Failed to fetch story content',
      });
    }
  }
}
