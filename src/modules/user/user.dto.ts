import { IsOptional } from 'class-validator';

import { AuthCredentialsDto } from '../auth/auth.dto';

export class CreateUserDto extends AuthCredentialsDto {
  @IsOptional()
  name?: string;
}
