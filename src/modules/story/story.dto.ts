import { IsArray, IsEnum, IsOptional, IsString, Length } from 'class-validator';

import { StoryGenre } from './story.constants';
import { UserPlan } from 'src/common/constants/user-plan.constant';

export class CreateStoryDto {
  @Length(1, undefined, { message: 'Story name is too short' })
  name: string;

  @Length(1, undefined, { message: 'Story description is too short' })
  description: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  about?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  preview?: string[];

  @IsEnum(StoryGenre, {
    each: true,
    message: 'Please provide a valid story genre',
  })
  genre: StoryGenre[];

  @IsString({ message: 'Please provide a cover image' })
  coverImage: string;

  @IsOptional()
  @IsEnum(UserPlan, { message: 'Invalid plan' })
  plan?: UserPlan;
}
