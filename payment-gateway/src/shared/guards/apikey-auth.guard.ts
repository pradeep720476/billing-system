import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ENV_KEYS } from '../types/env-keys';

@Injectable()
export class APIKeyAuthGuard implements CanActivate {
  constructor(private configService: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers['authorization'];
    console.log('header', authHeader);
    if (!authHeader || !authHeader.startsWith('Bearer')) {
      throw new UnauthorizedException('Missing or invalid Authorization header');
    }

    const apiKey = authHeader.split(' ')[1];
    const validKey = this.configService.get<string>(ENV_KEYS.API_KEY);

    if (apiKey !== validKey) {
      throw new UnauthorizedException('Invalid API Key');
    }

    return true;
  }
}
