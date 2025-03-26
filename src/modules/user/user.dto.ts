import { IsEmail, IsOptional, Length } from 'class-validator';

import { UserType } from './user.types';

export class CreateUserDto implements UserType {
  @IsOptional()
  name?: string;

  @IsEmail(undefined, { message: 'Please provide a valid Email Address' })
  email: string;

  @Length(4, undefined, {
    message: 'You must write a strong Password',
  })
  password: string;
}
