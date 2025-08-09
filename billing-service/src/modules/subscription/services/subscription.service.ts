import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { SubscriptionRepository } from '../repositories/subscription.repository';
import { UserRepository } from 'src/modules/user/repositories/user.respository';
import { Subscription } from '../domains/subscription.domain';
import { SubscriptionStatus } from '../domains/enums/subscription-status.enum';
import { CreateSubscriptionRequestDto } from '../controllers/dto/create-subscription-request.dto';
import { PaymentWebhookHandlerService } from '../../webhook/services/payment-webhook-handler.service';
import { TranscationRequestDto } from 'src/modules/webhook/controllers/dto/transaction-request.dto';
import { PlanRepository } from 'src/modules/plan/repositories/plan.repository';
import { v4 as uuidv4 } from 'uuid';
import { ConfigService } from '@nestjs/config';
import { ENV_KEYS } from 'src/shared/types/env-keys';

@Injectable()
export class SubscriptionService {
  constructor(
    private readonly subscriptionRepo: SubscriptionRepository,
    private readonly userRepo: UserRepository,
    private readonly planRepo: PlanRepository,
    private readonly paymentService: PaymentWebhookHandlerService,
    private readonly config: ConfigService,
  ) {}

  async create(userId: string, dto: CreateSubscriptionRequestDto): Promise<Subscription> {
    const user = await this.userRepo.findById(userId);
    if (!user) throw new NotFoundException('User not found');

    const plan = await this.planRepo.findById(dto.planId);
    if (!plan || !plan.isActive()) throw new BadRequestException('Invalid plan');

    const existingActive = await this.subscriptionRepo.findByUserIdAndStatus(
      userId,
      SubscriptionStatus.ACTIVE,
    );
    if (existingActive) throw new BadRequestException('User already has an active subscription');

    const now = new Date();
    const startDate = dto.startDate ?? now;
    const status =
      dto.trialDays && dto.trialDays > 0 ? SubscriptionStatus.TRIAL : SubscriptionStatus.PENDING;

    const subscription = new Subscription(
      uuidv4(),
      status,
      dto.autoRenew ?? true,
      startDate,
      Subscription.calculateEndDate(plan.billingCycle.cycle),
      Subscription.calculateTrialEndDate(dto.trialDays ?? 0),
      null,
      userId,
      dto.planId,
    );

    await this.paymentService.initiate(
      new TranscationRequestDto(
        subscription.id,
        plan.price,
        user.id,
        dto.paymentMethod,
        this.config.get<string>(ENV_KEYS.CALL_BACK_URL)! +
          this.config.get<string>(ENV_KEYS.CALL_BACK_PAYMENT_PATH)!,
      ),
    );

    return this.subscriptionRepo.save(subscription);
  }

  async upgrade(userId: string, newPlanId: string): Promise<Subscription> {
    const current = await this.subscriptionRepo.findByUserIdAndStatus(
      userId,
      SubscriptionStatus.ACTIVE,
    );
    if (!current) throw new BadRequestException('No active subscription');

    if (current.planId === newPlanId) {
      throw new BadRequestException('Already on this plan');
    }

    const newPlan = await this.planRepo.findById(newPlanId);
    if (!newPlan || !newPlan.isActive()) throw new BadRequestException('Invalid new plan');

    current.changePlan(newPlanId, newPlan.billingCycle);
    return this.subscriptionRepo.save(current);
  }

  async cancel(subscriptionId: string): Promise<Subscription> {
    const subscription = await this.subscriptionRepo.findById(subscriptionId);
    if (!subscription) throw new NotFoundException('Subscription not found');

    subscription.cancel(); // sets CANCELLED + cancelDate
    return this.subscriptionRepo.save(subscription);
  }

  async findById(id: string): Promise<Subscription> {
    const sub = await this.subscriptionRepo.findById(id);
    if (!sub) throw new NotFoundException('Subscription not found');
    return sub;
  }

  async findSubscriptionByUserId(userId: string): Promise<Subscription> {
    const exists = await this.userRepo.exists(userId);
    if (!exists) throw new NotFoundException('User not found');

    const sub = await this.subscriptionRepo.findByUserIdAndStatus(
      userId,
      SubscriptionStatus.ACTIVE,
    );
    if (!sub) throw new NotFoundException('No active subscription');
    return sub;
  }
}
