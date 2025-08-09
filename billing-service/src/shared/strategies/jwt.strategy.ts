import { Injectable } from '@nestjs/common';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import { ENV_KEYS } from 'src/shared/types/env-keys';
import { User } from 'src/shared/domain/user.domain';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly configService: ConfigService) {
    const secret = configService.get<string>(ENV_KEYS.JWT_SECRET);
    if (!secret) throw new Error('JWT_SECRET is not defined in the environment variables');
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: secret,
    });
  }

  async validate(user: User) {
    return { ...user };
  }
}
