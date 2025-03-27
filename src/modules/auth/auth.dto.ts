import { IsEmail, IsOptional, Length } from 'class-validator';

export class AuthCredentialsDto {
  @IsEmail(undefined, { message: 'Please provide a valid Email Address' })
  email: string;

  @Length(4, undefined, {
    message: 'Please provide a strong Password',
  })
  password: string;
}

export class SignUpDto extends AuthCredentialsDto {
  @IsOptional()
  name?: string;
}

export class SignInDto extends AuthCredentialsDto {}
