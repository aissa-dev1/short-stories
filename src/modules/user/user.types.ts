export type UserPlanType = 'free' | 'pro';

export interface UserType {
  _id?: any;
  name?: string;
  email: string;
  password: string;
  plan?: UserPlanType;
}
