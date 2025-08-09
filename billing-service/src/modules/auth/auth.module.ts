import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { ENV_KEYS } from 'src/shared/types/env-keys';
import { AuthService } from './services/auth.service';
import { JwtProvider } from './providers/jwt.provider';
import { JwtStrategy } from '../../shared/strategies/jwt.strategy';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from './controllers/auth.controller';
import { UserModule } from '../user/user.module';
import { RoleModule } from '../role/role.module';

@Module({
  imports: [
    PassportModule,
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: async (config: ConfigService) => {
        return {
          secret: config.get<string>(ENV_KEYS.JWT_SECRET),
          signOptions: { expiresIn: ENV_KEYS.JWT_ACCESS_TOKEN_EXPIRE },
        };
      },
    }),
    UserModule,
    RoleModule,
  ],
  providers: [AuthService, JwtProvider, JwtStrategy],
  controllers: [AuthController],
})
export class AuthModule {}
