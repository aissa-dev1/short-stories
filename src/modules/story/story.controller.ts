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
  Query,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { isValidObjectId } from 'mongoose';
import jsPDF from 'jspdf';
import { Response } from 'express';

import {
  CreateStoryDto,
  EditStoryDto,
  GetLibraryStoriesDto,
} from './story.dto';
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
import { LibraryStoriesWithRating, StoryWithRatingType } from './story.types';
import { StoryReviewWithDetails } from '../story-review/story-review.types';
import { UserService } from '../user/user.service';
import { capitalize } from 'src/utils/capitalize';
import { slugify } from 'src/utils/slugify';

@Controller('stories')
export class StoryController {
  constructor(
    private readonly storyService: StoryService,
    private readonly storyContentService: StoryContentService,
    private readonly storyReviewService: StoryReviewService,
    private readonly userService: UserService,
  ) {}

  @Get('featured')
  async getFeaturedStories() {
    try {
      let data: {
        stories: StoryWithRatingType[];
        reviews: StoryReviewWithDetails[];
      } = {
        stories: [],
        reviews: [],
      };
      const featuredStories = await this.storyService.getFeaturedStories();

      for (const featuredStory of featuredStories) {
        const [rating, featuredReview] = await Promise.all([
          this.storyReviewService.getStoryRating(String(featuredStory._id)),
          this.storyReviewService.findOneLean({
            storyId: String(featuredStory._id),
          }),
        ]);

        data = {
          ...data,
          stories: [
            ...data.stories,
            {
              ...featuredStory,
              rating,
            },
          ],
        };

        if (!featuredReview) continue;

        const featuredReviewUser = await this.userService.findOneLean({
          _id: featuredReview.userId,
        });

        if (!featuredReviewUser) continue;

        data = {
          ...data,
          reviews: [
            ...data.reviews,
            {
              ...featuredReview,
              userName: featuredReviewUser?.name,
              storyName: featuredStory.name,
            },
          ],
        };
      }

      return {
        success: true,
        data,
      };
    } catch (error) {
      throw new BadRequestException({
        success: false,
        message: 'Failed to get featured stories',
      });
    }
  }

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

  @Get(':slug/id')
  async getStoryIdBySlug(@Param('slug') slug: string) {
    try {
      const story = await this.storyService.getStoryIdBySlug(slug);

      if (!story) {
        throw new NotFoundException({
          success: false,
          message: 'Story not found',
        });
      }

      return {
        success: true,
        data: story,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }

      throw new BadRequestException({
        success: false,
        message: 'Failed to get story id',
      });
    }
  }

  @Get(':slug')
  async findOneBySlug(@Param('slug') slug: string) {
    try {
      const story = await this.storyService.findOneLean({
        slug,
      });

      if (!story) {
        throw new NotFoundException({
          success: false,
          message: 'Story not found',
        });
      }

      const rating = await this.storyReviewService.getStoryRating(
        String(story._id),
      );

      return {
        success: true,
        data: {
          ...story,
          rating,
        },
      };
    } catch (error) {
      if (
        error instanceof BadRequestException ||
        error instanceof NotFoundException
      ) {
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
        message: 'Failed to create story',
      });
    }
  }

  @Post('read/:id')
  @UseGuards(JwtAuthGuard)
  async readStory(@Param('id') id: string) {
    if (!isValidObjectId(id)) {
      throw new BadRequestException({
        success: false,
        message: 'Invalid story ID format',
      });
    }

    try {
      const story = await this.storyService.findOneLean({ _id: id });

      if (!story) {
        throw new NotFoundException({
          success: false,
          message: 'Story not found',
        });
      }

      await this.storyService.updateStory(id, {
        views: story.views + 1,
      });
      return {
        success: true,
      };
    } catch (error) {
      if (
        error instanceof BadRequestException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }

      throw new BadRequestException({
        success: false,
        message: 'Failed to read this story',
      });
    }
  }

  @Post('download/:id')
  @UseGuards(JwtAuthGuard)
  async downloadStory(@Param('id') id: string, @Res() res: Response) {
    if (!isValidObjectId(id)) {
      throw new BadRequestException({
        success: false,
        message: 'Invalid story ID format',
      });
    }

    try {
      const story = await this.storyService.findOneLean({ _id: id });

      if (!story) {
        throw new NotFoundException({
          success: false,
          message: 'Story not found',
        });
      }

      const doc = new jsPDF();

      doc.text(`Story: ${story.name}`, 10, 10);

      const pdfBuffer = Buffer.from(doc.output('arraybuffer'));

      await this.storyService.updateStory(id, {
        downloads: story.downloads + 1,
      });

      res.set({
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename=example.pdf',
        'Content-Length': pdfBuffer.length,
      });

      res.end(
        JSON.stringify({
          success: true,
          data: pdfBuffer,
        }),
      );
    } catch (error) {
      if (
        error instanceof BadRequestException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }

      throw new BadRequestException({
        success: false,
        message: 'Failed to download this story',
      });
    }
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, UserAdminGuard)
  async editStory(@Param('id') id: string, @Body() dto: EditStoryDto) {
    if (!isValidObjectId(id)) {
      throw new BadRequestException({
        success: false,
        message: 'Invalid story ID format',
      });
    }

    try {
      const story = await this.storyService.findOneLean({
        _id: id,
      });

      if (!story) {
        throw new NotFoundException({
          success: false,
          message: 'Story not found',
        });
      }

      const storyContent = await this.storyContentService.findOneLean({
        storyId: String(story._id),
      });

      if (!storyContent) {
        throw new NotFoundException({
          success: false,
          message: 'Story content not found',
        });
      }

      const slug = slugify(dto.name);
      await Promise.all([
        this.storyService.updateStory(id, {
          ...dto,
          slug,
        }),
        this.storyContentService.updateStoryContent(String(storyContent._id), {
          content: dto.content,
        }),
      ]);

      return {
        success: true,
        data: {
          message: 'Story edited successfully',
          slug,
        },
      };
    } catch (error) {
      if (
        error instanceof BadRequestException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }

      throw new BadRequestException({
        success: false,
        message: 'Failed to edit story',
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
      const storyName = `${capitalize(getRandomName())} ${capitalize(getRandomName())}`;
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
        this.storyReviewService.deleteMany({ storyId: id }),
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
      this.storyService.deleteMany(),
      this.storyContentService.deleteMany(),
      this.storyReviewService.deleteMany(),
    ]);
    return { message: 'done' };
  }
}
