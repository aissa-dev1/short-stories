import { UserPlan } from 'src/common/constants/user-plan.constant';

export type UserRoleType = 'user' | 'admin';

export interface UserType {
  _id: unknown;
  name: string;
  email: string;
  password?: string;
  plan: UserPlan;
  role: UserRoleType;
  createdAt: Date;
  updatedAt: Date;
}

export interface CurrentUserType {
  id: string;
}
