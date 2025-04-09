import { UserPlan } from 'src/common/constants/user-plan.constant';

export type UserRoleType = 'user' | 'admin';

export interface UserType {
  _id: any;
  name: string;
  email: string;
  password?: string;
  plan: UserPlan;
  role: UserRoleType;
  createdAt?: number;
  updatedAt?: number;
}

export interface CurrentUserType {
  id: string;
}
