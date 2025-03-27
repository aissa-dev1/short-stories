import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

import { UserPlanType, UserRoleType } from './user.types';

@Schema({ collection: 'users', timestamps: true })
export class User extends Document {
  @Prop()
  name: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true, select: false })
  password: string;

  @Prop({ default: 'free' })
  plan: UserPlanType;

  @Prop({ default: 'user' })
  role: UserRoleType;
}

export const UserSchema = SchemaFactory.createForClass(User);
