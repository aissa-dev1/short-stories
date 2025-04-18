import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { StoryContentController } from './story-content.controller';
import { StoryContentService } from './story-content.service';
import { StoryContent, StoryContentSchema } from './story-content.model';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: StoryContent.name,
        schema: StoryContentSchema,
      },
    ]),
  ],
  controllers: [StoryContentController],
  providers: [StoryContentService],
  exports: [StoryContentService],
})
export class StoryContentModule {}
