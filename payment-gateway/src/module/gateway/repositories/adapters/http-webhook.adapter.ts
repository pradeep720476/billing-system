import { Injectable } from '@nestjs/common';
import { WebhookAdapter } from '../ports/webhook.adapter';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { PaymentStatus } from 'src/shared/enums/payment-status.enum';
import * as crypto from 'crypto';
import { ENV_KEYS } from 'src/shared/types/env-keys';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class HttpWebhookAdapter implements WebhookAdapter {
  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}

  async sendTransactionResult(
    subscriptionId: string,
    status: PaymentStatus,
    url: string,
  ): Promise<void> {
    const payload = { subscriptionId, status };
    console.log('rawBody', payload);
    console.log('sceret', this.configService.get(ENV_KEYS.WEBHOOK_SECRET));
    
    const signature = crypto
      .createHmac(
        this.configService.get(ENV_KEYS.ALGO) || 'sha256',
        this.configService.get(ENV_KEYS.WEBHOOK_SECRET)!,
      )
      .update(JSON.stringify(payload))
      .digest(this.configService.get(ENV_KEYS.DIGEST) || 'hex');
      console.log('signature', signature);
    try {
      await firstValueFrom(
        this.httpService.patch(url, payload, {
          headers: { 'X-Signature': signature },
        }),
      );
    } catch (e) {
      throw e;
    }
  }
}
