import { Prop, Schema } from '@nestjs/mongoose';
import mongoose from 'mongoose';

@Schema({ collection: 'story-reviews', timestamps: true })
export class StoryReview {
  @Prop({ required: true })
  userId: mongoose.Types.ObjectId;

  @Prop({ required: true })
  storyId: mongoose.Types.ObjectId;

  @Prop({ required: true })
  stars: number;

  @Prop({ required: true })
  comment: string;
}
