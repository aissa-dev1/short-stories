import { IsMongoId, IsNumber, Length, Max, Min } from 'class-validator';

export class CreateStoryReviewDto {
  @IsMongoId()
  storyId: any;

  @IsNumber()
  @Min(1)
  @Max(5)
  stars: number;

  @Length(1, undefined, {
    message: 'Story review comment cannot be empty',
  })
  comment: string;
}
