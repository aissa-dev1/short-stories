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
