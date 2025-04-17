import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

import { UserPlan, UserRole } from './user.constants';

@Schema({ collection: 'users', timestamps: true })
export class User extends Document {
  @Prop()
  name: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true, select: false })
  password: string;

  @Prop({ default: 'free' })
  plan: UserPlan;

  @Prop({ default: 'user' })
  role: UserRole;
}

export const UserSchema = SchemaFactory.createForClass(User);
