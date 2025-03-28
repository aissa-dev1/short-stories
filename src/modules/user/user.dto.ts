import { IsOptional, Length } from 'class-validator';

import { AuthCredentialsDto } from '../auth/auth.dto';

export class CreateUserDto extends AuthCredentialsDto {
  @IsOptional()
  name?: string;
}

export class EditNameDto {
  @Length(2, undefined, {
    message: 'This Name is too short',
  })
  name: string;
}
