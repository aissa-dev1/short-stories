import { UserPlan } from '../user/user.constants';

export interface StoryType {
  _id: any;
  userId: any;
  name: string;
  slug: string;
  description: string;
  about: string[];
  preview: string[];
  genre: string[];
  coverImage: string;
  views: number;
  downloads: number;
  plan: UserPlan;
  createdAt: Date;
  updatedAt: Date;
}

export interface StoryWithRatingType extends StoryType {
  rating: number;
}

export interface LibraryStories {
  stories: StoryType[];
  count: number;
}

export interface LibraryStoriesWithRating {
  stories: StoryWithRatingType[];
  count: number;
}
