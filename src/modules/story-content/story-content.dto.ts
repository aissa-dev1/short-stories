import { IsArray, IsMongoId, IsOptional, IsString } from 'class-validator';

export class CreateStoryContentDto {
  @IsMongoId()
  storyId: any;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  content?: string;
}
