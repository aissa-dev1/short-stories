import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

import { UserPlan, UserRole } from './user.constants';

@Schema({ collection: 'users', timestamps: true, versionKey: false })
export class User extends Document {
  @Prop()
  name: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true, select: false })
  password: string;

  @Prop({ default: UserPlan.Free })
  plan: UserPlan;

  @Prop({ default: UserRole.User })
  role: UserRole;
}

export const UserSchema = SchemaFactory.createForClass(User);
