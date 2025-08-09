import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { SubscriptionModule } from './modules/subscription/subscription.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ENV_KEYS } from './shared/types/env-keys';
import { UserModule } from './modules/user/user.module';
import { PlanModule } from './modules/plan/plan.module';
import { AuthModule } from './modules/auth/auth.module';
import { SeederModule } from './seeds/seeder.module';
import { JwtAuthGuard } from './shared/guards/jwt-auth.guard';
import { RoleGuard } from './shared/guards/role.guard';
import { APP_GUARD } from '@nestjs/core';

@Module({
  imports: [
    SeederModule,
    SubscriptionModule,
    UserModule,
    PlanModule,
    AuthModule,
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
  providers: [
    AppService,
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: RoleGuard },
  ],
})
export class AppModule {}
