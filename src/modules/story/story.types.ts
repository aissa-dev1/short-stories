import { UserPlan } from 'src/common/constants/user-plan.constant';

export interface StoryType {
  _id: unknown;
  userId: unknown;
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
