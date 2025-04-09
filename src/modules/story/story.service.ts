import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { Story } from './story.model';
import { CreateStoryDto } from './story.dto';

@Injectable()
export class StoryService {
  constructor(
    @InjectModel(Story.name) private readonly storyModel: Model<Story>,
  ) {}

  async createStory(dto: CreateStoryDto, userId: any): Promise<Story> {
    const story = await this.storyModel.create({
      userId,
      ...dto,
    });
    await story.save();
    return story;
  }
}
