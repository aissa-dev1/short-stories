import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './modules/user/user.module';
import { AuthModule } from './modules/auth/auth.module';
import { ProThemeModule } from './modules/pro-theme/pro-theme.module';
import { ProFontModule } from './modules/pro-font/pro-font.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => ({
        uri: config.get<string>(
          config.get('NODE_ENV') === 'development' ? 'DB_URI_DEV' : 'DB_URI',
        ),
        dbName: 'short-stories-db',
      }),
      inject: [ConfigService],
    }),
    UserModule,
    AuthModule,
    ProThemeModule,
    ProFontModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
