import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { StoryContent } from './story-content.model';
import { CreateStoryContentDto } from './story-content.dto';

@Injectable()
export class StoryContentService {
  constructor(
    @InjectModel(StoryContent.name)
    private readonly storyContentModel: Model<StoryContent>,
  ) {}

  async createStoryContent(dto: CreateStoryContentDto): Promise<StoryContent> {
    const storyContent = await this.storyContentModel.create({
      storyId: dto.storyId,
      content: dto.content,
    });
    await storyContent.save();
    return storyContent;
  }
}
