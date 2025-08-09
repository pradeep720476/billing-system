import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { GatewayModule } from './module/gateway/gateway.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ENV_KEYS } from './shared/types/env-keys';
import { APP_GUARD } from '@nestjs/core';
import { APIKeyAuthGuard } from './shared/guards/apikey-auth.guard';

@Module({
  imports: [
    GatewayModule,
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `.env.${process.env.NODE_ENV || 'local'}`,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        console.log(__dirname);
        return {
          type: configService.get<'postgres'>(ENV_KEYS.DB_TYPE),
          host: configService.get<string>(ENV_KEYS.DB_HOST),
          port: parseInt(configService.get<string>(ENV_KEYS.DB_PORT, '5432'), 10),
          username: configService.get<string>(ENV_KEYS.DB_USER_NAME),
          password: configService.get<string>(ENV_KEYS.DB_PASSWORD),
          database: configService.get<string>(ENV_KEYS.DB_NAME),
          entities: [`${__dirname}/**/*.entity{.ts,.js}`],
          logging: true,
          synchronize: true,
        };
      },
    }),
  ],
  controllers: [AppController],
  providers: [AppService, { provide: APP_GUARD, useClass: APIKeyAuthGuard }],
})
export class AppModule {}
