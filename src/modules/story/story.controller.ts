import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Post,
  Query,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { isValidObjectId } from 'mongoose';

import { CreateStoryDto, GetLibraryStoriesDto } from './story.dto';
import { StoryService } from './story.service';
import { CurrentUserType } from '../user/user.types';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { MarkForDeletion } from 'src/common/decorators/mark-for-deletion.decorator';
import { MarkForDeletionReason } from 'src/common/constants/mark-for-deletion-reason.constant';
import { StoryGenre } from './story.constants';
import { UserAdminGuard } from '../user/guards/user-admin.guard';
import { CurrentUser } from '../user/decorators/current-user.decorator';
import { UserPlan } from '../user/user.constants';
import { StoryContentService } from '../story-content/story-content.service';
import { StoryReviewService } from '../story-review/story-review.service';
import { LibraryStoriesWithRating } from './story.types';

@Controller('stories')
export class StoryController {
  constructor(
    private readonly storyService: StoryService,
    private readonly storyContentService: StoryContentService,
    private readonly storyReviewService: StoryReviewService,
  ) {}

  @Get('library')
  async getLibraryStories(@Query() dto: GetLibraryStoriesDto) {
    try {
      const libraryStories = await this.storyService.findAllLeanPaginated(
        {
          name: { $regex: dto.q ?? '', $options: 'i' } as any,
          ...this.storyService.buildLibraryStoriesFilters(dto),
        },
        dto.skip,
        dto.limit,
      );
      const data: LibraryStoriesWithRating = {
        stories: [],
        count: libraryStories.count,
      };

      for (const story of libraryStories.stories) {
        const rating = await this.storyReviewService.getStoryRating(story._id);
        data.stories = [
          ...data.stories,
          {
            ...story,
            rating,
          },
        ];
      }

      return { success: true, data };
    } catch (error) {
      throw new BadRequestException({
        sucess: false,
        message: 'Failed to fetch library stories',
      });
    }
  }

  @Get(':slugAndId')
  async findOneBySlugAndId(@Param('slugAndId') slugAndId: string) {
    const id = slugAndId.split('-').pop() || '';

    if (!isValidObjectId(id)) {
      throw new BadRequestException({
        success: false,
        message: 'Invalid story ID format',
      });
    }

    try {
      const [story, rating] = await Promise.all([
        this.storyService.findOneLean({
          _id: id,
        }),
        this.storyReviewService.getStoryRating(id),
      ]);

      if (!story) {
        throw new NotFoundException({
          success: false,
          message: 'Story not found',
        });
      }

      return {
        success: true,
        data: {
          ...story,
          rating,
        },
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }

      throw new BadRequestException({
        success: false,
        message: 'Failed to fetch story',
      });
    }
  }

  @Post()
  @UseGuards(JwtAuthGuard, UserAdminGuard)
  async createStory(
    @CurrentUser() currentUser: CurrentUserType,
    @Body() dto: CreateStoryDto,
  ) {
    try {
      const story = await this.storyService.createStory(dto, currentUser.id);
      await this.storyContentService.createStoryContent({
        storyId: String(story._id),
        content: dto.content,
      });
      return {
        success: true,
        message: `Story '${story.name}' created successfully`,
      };
    } catch (error) {
      throw new BadRequestException({
        success: false,
        message: 'Failed to create this story',
      });
    }
  }

  @Post('fake-stories')
  @UseGuards(JwtAuthGuard, UserAdminGuard)
  @MarkForDeletion(MarkForDeletionReason.Testing)
  async createFakeStories(@CurrentUser() currentUser: CurrentUserType) {
    const chars = 'azertyuiopqsdfghjklmwxcvbn123456789';

    function getRandomName(): string {
      let name = '';
      for (let i = 0; i < 5; i++) {
        name += chars[Math.floor(Math.random() * chars.length)];
      }
      return name;
    }

    const content: string[] = [];
    for (let i = 0; i < 100; i++) {
      content.push('Hello world! '.repeat(10));
    }
    for (let i = 0; i < 25; i++) {
      const storyName = getRandomName();
      await this.createStory(currentUser, {
        name: storyName,
        description: `Story description ${i + 1}`,
        coverImage: 'short-story-cover.jpeg',
        genre:
          Math.random() > 0.5 ? [StoryGenre.Adventure] : [StoryGenre.Mystery],
        plan: UserPlan.Free,
        content: [`Hello ${storyName} `.repeat(10), ...content],
      });
      console.log(`Story ${i} done`);
    }
    return { message: 'done' };
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async deleteStory(
    @CurrentUser() currentUser: CurrentUserType,
    @Param('id') id: string,
  ) {
    if (!isValidObjectId(id)) {
      throw new BadRequestException({
        success: false,
        message: 'Invalid story ID format',
      });
    }

    try {
      const story = await this.storyService.findOneLean({
        userId: currentUser.id,
      });

      if (!story) {
        throw new UnauthorizedException({
          success: false,
          message: `You don't have permission to delete this story`,
        });
      }

      await Promise.all([
        this.storyService.deleteOne({ _id: id }),
        this.storyContentService.deleteOne({ storyId: id }),
      ]);
      return {
        success: true,
        message: 'Story have been deleted successfully',
      };
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }

      throw new BadRequestException({
        success: false,
        message: 'Failed to delete story',
      });
    }
  }

  @Delete()
  @UseGuards(JwtAuthGuard, UserAdminGuard)
  @MarkForDeletion(MarkForDeletionReason.Testing)
  async deleteAll() {
    await Promise.all([
      this.storyService.deleteAll(),
      this.storyContentService.deleteAll(),
    ]);
    return { message: 'done' };
  }
}
