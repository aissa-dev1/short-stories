import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { DeleteResult, Model } from 'mongoose';

import { StoryContent } from './story-content.model';
import { CreateStoryContentDto } from './story-content.dto';
import { StoryContentType } from './story-content.types';

@Injectable()
export class StoryContentService {
  constructor(
    @InjectModel(StoryContent.name)
    private readonly storyContentModel: Model<StoryContent>,
  ) {}

  findOneLean(
    filter: Partial<StoryContentType> = {},
  ): Promise<StoryContentType | null> {
    return this.storyContentModel
      .findOne(filter)
      .lean<StoryContentType>()
      .exec();
  }

  async createStoryContent(dto: CreateStoryContentDto): Promise<StoryContent> {
    const storyContent = await this.storyContentModel.create({
      storyId: dto.storyId,
      content: dto.content,
    });
    await storyContent.save();
    return storyContent;
  }

  deleteOne(filter: Partial<StoryContentType> = {}): Promise<DeleteResult> {
    return this.storyContentModel.deleteOne(filter);
  }

  deleteAll() {
    return this.storyContentModel.deleteMany();
  }
}
