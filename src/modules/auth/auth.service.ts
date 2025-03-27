import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { CookieOptions } from 'express';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async generateAuthToken(id: string): Promise<string> {
    const authToken = await this.jwtService.signAsync({
      sub: id,
    });
    return authToken;
  }

  getTokenCookieOptions(): CookieOptions {
    return {
      httpOnly: true,
      secure: this.configService.get('NODE_ENV') === 'production',
      sameSite:
        this.configService.get('NODE_ENV') === 'production' ? 'strict' : 'lax',
      domain:
        this.configService.get('NODE_ENV') === 'production'
          ? this.configService.get('CLIENT_DOMAIN')
          : undefined,
      maxAge: 15 * 60 * 1000, // 15m
    };
  }
}
