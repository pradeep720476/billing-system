// src/webhooks/guards/webhook-signature.guard.ts
import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import { ENV_KEYS } from '../types/env-keys';

@Injectable()
export class WebhookSignatureGuard implements CanActivate {
  constructor(private readonly configService: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
      const req: any = context.switchToHttp().getRequest();
      console.log(req.headers)
    const signature = req.headers['x-signature'] as string;
    const secret = this.configService.get<string>(ENV_KEYS.WEBHOOK_SECRET)!;
      console.log(req.headers);
    if (!signature && !secret) {
      throw new UnauthorizedException('Missing signature or secret');
    }
    console.log('sceret', this.configService.get(ENV_KEYS.WEBHOOK_SECRET));
    const rawBody = JSON.stringify(req.body);
    console.log('rawBody', rawBody);
    const expectedSignature = crypto
      .createHmac(
        this.configService.get(ENV_KEYS.ALGO) || 'sha256',
        this.configService.get(ENV_KEYS.WEBHOOK_SECRET)!,
      )
      .update(rawBody)
      .digest(this.configService.get(ENV_KEYS.DIGEST) || 'hex');
      console.log("expectedSignature", expectedSignature);
      console.log("sig", signature);
    if (signature !== expectedSignature) {
      throw new UnauthorizedException('Invalid webhook signature');
    }
    return true;
  }
}
