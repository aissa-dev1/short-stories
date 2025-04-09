import { Body, Controller, Post, UseGuards } from '@nestjs/common';

import { CreateStoryDto } from './story.dto';
import { StoryService } from './story.service';
import { CurrentUserType } from '../user/user.types';
import { AdminGuard } from 'src/common/guards/admin.guard';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';

@Controller('stories')
export class StoryController {
  constructor(private readonly storyService: StoryService) {}

  @Post()
  @UseGuards(JwtAuthGuard, AdminGuard)
  async createStory(
    @CurrentUser() currentUser: CurrentUserType,
    @Body() dto: CreateStoryDto,
  ) {
    await this.storyService.createStory(dto, currentUser.id);
    return { message: `Story '${dto.name}' created successfully` };
  }
}
