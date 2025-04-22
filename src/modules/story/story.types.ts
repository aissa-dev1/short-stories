import { UserPlan } from '../user/user.constants';

export interface StoryType {
  _id: any;
  userId: any;
  name: string;
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

export interface LibraryStories {
  stories: StoryType[];
  count: number;
}

export interface LibraryStoriesWithRating {
  stories: (StoryType & { rating: number })[];
  count: number;
}
