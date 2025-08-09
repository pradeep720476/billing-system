import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { User } from 'src/shared/domain/user.domain';
import { ConfigService } from '@nestjs/config';
import { ENV_KEYS } from 'src/shared/types/env-keys';
import { Role } from 'src/modules/role/domains/role.domain';

@Injectable()
export class JwtProvider {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  token(user: User, role: Role): string {
    const payload = { id: user.id, roles: role ? [role] : [] };
    return this.jwtService.sign(payload, {
      expiresIn: this.configService.get<string>(ENV_KEYS.JWT_ACCESS_TOKEN_EXPIRE),
    });
  }
}
