import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';

import { UserPlan } from '../user/user.constants';

@Schema({ collection: 'stories', timestamps: true, versionKey: false })
export class Story extends Document {
  @Prop({ required: true })
  userId: mongoose.Types.ObjectId;

  @Prop({ required: true, unique: true })
  name: string;

  @Prop({ required: true, unique: true })
  slug: string;

  @Prop({ required: true })
  description: string;

  @Prop({ default: [] })
  about: string[];

  @Prop({ default: [] })
  preview: string[];

  @Prop({ required: true })
  genre: string[];

  // TODO: Add default cover image
  @Prop({ required: true })
  coverImage: string;

  @Prop({ default: 0 })
  views: number;

  @Prop({ default: 0 })
  downloads: number;

  @Prop({ default: UserPlan.Free })
  plan: UserPlan;
}

export const StorySchema = SchemaFactory.createForClass(Story);
