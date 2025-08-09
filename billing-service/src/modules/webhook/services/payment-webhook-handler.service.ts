import { Injectable, NotFoundException } from '@nestjs/common';
import { SubscriptionRepository } from 'src/modules/subscription/repositories/subscription.repository';
import { SubscriptionStatus } from 'src/modules/subscription/domains/enums/subscription-status.enum';
import { PaymentStatus } from 'src/shared/enums/payment-status.enum';
import { TranscationRequestDto } from '../controllers/dto/transaction-request.dto';
import { firstValueFrom, timer } from 'rxjs';
import { retry } from 'rxjs/operators';
import { HttpService } from '@nestjs/axios';
import { TransactionDto } from '../controllers/dto/transaction';
import { ConfigService } from '@nestjs/config';
import { ENV_KEYS } from 'src/shared/types/env-keys';
import { PlanRepository } from 'src/modules/plan/repositories/plan.repository';
import { Subscription } from 'src/modules/subscription/domains/subscription.domain';

@Injectable()
export class PaymentWebhookHandlerService {
  constructor(
    private readonly subscriptionRepo: SubscriptionRepository,
    private readonly planRepo: PlanRepository,
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}

  async handle(dto: TransactionDto): Promise<void> {
    const subscription = await this.subscriptionRepo.findById(dto.subscriptionId);
    if (!subscription) throw new NotFoundException('Subscription not found');

    if (subscription.status === SubscriptionStatus.ACTIVE && dto.status === PaymentStatus.SUCCESS) {
      return;
    }

    if (dto.status === PaymentStatus.SUCCESS) {
      subscription.updateStatus(SubscriptionStatus.ACTIVE);

      if (subscription.planId) {
        const plan = await this.planRepo.findById(subscription.planId);
        if (plan) {
          subscription.endDate = Subscription.calculateEndDate(plan.billingCycle.cycle);
        }
      }
    } else if (dto.status === PaymentStatus.FAILED) {
      subscription.updateStatus(SubscriptionStatus.PAST_DUE);
    }
    await this.subscriptionRepo.save(subscription);
  }

  async initiate(dto: TranscationRequestDto): Promise<void> {
    const url = this.configService.get<string>(ENV_KEYS.PAYMENT_GATEWAY_URL)!;
    const path = this.configService.get<string>(ENV_KEYS.PAYMENT_INITIATE_PATH)!;
    const key = this.configService.get<string>(ENV_KEYS.PAYMENT_GATEWAY_API_KEY)!;
    const endpoint = new URL(path, url).toString();
    try {
      await firstValueFrom(
        this.httpService
          .post(endpoint, dto, {
            headers: { Authorization: `Bearer ${key}` },
            timeout: 5000,
          })
          .pipe(
            retry({
              count: 3,
              resetOnSuccess: true,
              delay: (_err, retryCount) => timer(250 * retryCount),
            }),
          ),
      );
    } catch (error: any) {
      console.warn(`[gateway] initiate failed after retries: ${error?.message ?? error}`);
    }
  }
}
