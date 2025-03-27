export type UserPlanType = 'free' | 'pro';

export type UserRoleType = 'user' | 'admin';

export interface UserType {
  _id: any;
  name: string;
  email: string;
  password?: string;
  plan: UserPlanType;
  role: UserRoleType;
  createdAt?: number;
  updatedAt?: number;
}

export interface UserJwtType {
  id: string;
}
