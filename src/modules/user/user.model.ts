import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

import { UserPlanType, UserType } from './user.types';

@Schema({ collection: 'users', timestamps: true })
export class User extends Document implements UserType {
  @Prop()
  name: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true, select: false })
  password: string;

  @Prop({ default: 'free' })
  plan: UserPlanType;
}

export const UserSchema = SchemaFactory.createForClass(User);
