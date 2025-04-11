import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  InternalServerErrorException,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';

import { CreateStoryDto, GetLibraryStoriesDto } from './story.dto';
import { StoryService } from './story.service';
import { CurrentUserType } from '../user/user.types';
import { AdminGuard } from 'src/common/guards/admin.guard';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { MarkForDeletion } from 'src/common/decorators/mark-for-deletion.decorator';
import { MarkForDeletionReason } from 'src/common/constants/mark-for-deletion-reason.constant';
import { StoryGenre } from './story.constants';
import { UserPlan } from 'src/common/constants/user-plan.constant';

@Controller('stories')
export class StoryController {
  constructor(private readonly storyService: StoryService) {}

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
      return { success: true, data: libraryStories };
    } catch (error: any) {
      throw new BadRequestException({
        sucess: false,
        message: 'Failed to fetch library stories',
      });
    }
  }

  @Get(':slugAndId')
  findOneBySlugAndId(@Param('slugAndId') slugAndId: string) {
    const id = slugAndId.split('-').pop() || '';
    return this.storyService.findOneLean({
      _id: id,
    });
  }

  @Post()
  @UseGuards(JwtAuthGuard, AdminGuard)
  async createStory(
    @CurrentUser() currentUser: CurrentUserType,
    @Body() dto: CreateStoryDto,
  ) {
    await this.storyService.createStory(dto, currentUser.id);
    return { message: `Story '${dto.name}' created successfully` };
  }

  @Post('fake-stories')
  @UseGuards(JwtAuthGuard, AdminGuard)
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

    for (let i = 0; i < 50; i++) {
      await this.createStory(currentUser, {
        name: getRandomName(),
        description: `Story description ${i + 1}`,
        coverImage: 'short-story-cover.jpeg',
        genre:
          Math.random() > 0.5 ? [StoryGenre.Adventure] : [StoryGenre.Mystery],
        plan: Math.random() > 0.5 ? UserPlan.Free : UserPlan.Pro,
      });
      console.log(`Story ${i} done`);
    }
    return { message: 'done' };
  }

  @Delete()
  @UseGuards(JwtAuthGuard, AdminGuard)
  @MarkForDeletion(MarkForDeletionReason.Testing)
  async deleteAll() {
    await this.storyService.deleteAll();
    return { message: 'done' };
  }
}
