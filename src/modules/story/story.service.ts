import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { DeleteResult, Model } from 'mongoose';

import { Story } from './story.model';
import { CreateStoryDto, GetLibraryStoriesDto } from './story.dto';
import { LibraryStories, StoryType } from './story.types';
import {
  ALL_GENRES,
  ALL_PLANS,
  PAGINATION_LIMIT,
} from 'src/common/constants/filters.constant';

@Injectable()
export class StoryService {
  constructor(
    @InjectModel(Story.name) private readonly storyModel: Model<Story>,
  ) {}

  findAllLean(filter: Partial<StoryType> = {}): Promise<StoryType[]> {
    return this.storyModel.find(filter).lean<StoryType[]>().exec();
  }

  async findAllLeanPaginated(
    filter: Partial<StoryType> = {},
    skip = 0,
    limit = PAGINATION_LIMIT,
  ): Promise<LibraryStories> {
    const [stories, count] = await Promise.all([
      this.storyModel
        .find(filter)
        .skip(skip)
        .limit(limit)
        .lean<StoryType[]>()
        .exec(),
      this.storyModel.countDocuments(filter),
    ]);
    return { stories, count };
  }

  findOneLean(filter: Partial<StoryType> = {}): Promise<StoryType | null> {
    return this.storyModel.findOne(filter).lean<StoryType>().exec();
  }

  async createStory(dto: CreateStoryDto, userId: any): Promise<Story> {
    const story = await this.storyModel.create({
      userId,
      ...dto,
    });
    await story.save();
    return story;
  }

  updateStory(id: string, update?: Partial<StoryType>): Promise<Story | null> {
    return this.storyModel.findByIdAndUpdate(id, update, { new: true }).exec();
  }

  deleteAll() {
    return this.storyModel.deleteMany();
  }

  deleteOne(filter: Partial<StoryType> = {}): Promise<DeleteResult> {
    return this.storyModel.deleteOne(filter);
  }

  buildLibraryStoriesFilters(
    dto: GetLibraryStoriesDto,
  ): Record<string, string> {
    const filters = {};

    if (dto.plan && dto.plan.toLowerCase() !== ALL_PLANS) {
      filters['plan'] = dto.plan.toLowerCase();
    }
    if (dto.genre && dto.genre.toLowerCase() !== ALL_GENRES) {
      filters['genre'] = dto.genre.toLowerCase();
    }

    return filters;
  }
}
