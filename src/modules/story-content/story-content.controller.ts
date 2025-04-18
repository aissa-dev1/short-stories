import { Controller } from '@nestjs/common';

import { StoryContentService } from './story-content.service';

@Controller('story-contents')
export class StoryContentController {
  constructor(private readonly storyContentService: StoryContentService) {}
}
