import { UserPlan, UserRole } from './user.constants';

export interface UserType {
  _id: unknown;
  name: string;
  email: string;
  password?: string;
  plan: UserPlan;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}

export interface CurrentUserType {
  id: string;
}
