import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { StoryReview } from './story-review.model';
import { CreateStoryReviewDto } from './story-review.dto';
import { StoryReviewType } from './story-review.types';

@Injectable()
export class StoryReviewService {
  constructor(
    @InjectModel(StoryReview.name)
    private readonly storyReviewModel: Model<StoryReview>,
  ) {}

  findAllLean(
    filter: Partial<StoryReviewType> = {},
  ): Promise<StoryReviewType[]> {
    return this.storyReviewModel.find(filter).lean<StoryReviewType[]>().exec();
  }

  findOneLean(
    filter: Partial<StoryReviewType> = {},
  ): Promise<StoryReviewType | null> {
    return this.storyReviewModel.findOne(filter).lean<StoryReviewType>().exec();
  }

  async createStoryReview(
    dto: CreateStoryReviewDto,
    userId: string,
  ): Promise<StoryReview> {
    const storyReview = await this.storyReviewModel.create({
      ...dto,
      userId,
    });
    await storyReview.save();
    return storyReview;
  }

  async getStoryRating(storyId: any): Promise<number> {
    const storyReviews = await this.storyReviewModel
      .find({
        storyId: typeof storyId === 'string' ? storyId : String(storyId),
      })
      .select('stars')
      .lean<StoryReviewType[]>()
      .exec();
    return (
      storyReviews.reduce((a, b) => {
        return a + b.stars;
      }, 0) / storyReviews.length || 0
    );
  }
}
