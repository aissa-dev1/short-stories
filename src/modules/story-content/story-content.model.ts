import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';

@Schema({ collection: 'story-contents', timestamps: true, versionKey: false })
export class StoryContent extends Document {
  @Prop({ required: true })
  storyId: mongoose.Types.ObjectId;

  @Prop({ default: [] })
  content: string[];
}

export const StoryContentSchema = SchemaFactory.createForClass(StoryContent);
