// src/modules/subscription/repositories/subscription.repository.ts
import { SubscriptionStatus } from '../domains/enums/subscription-status.enum';
import { Subscription } from '../domains/subscription.domain';

export abstract class SubscriptionRepository {
  abstract save(sub: Subscription): Promise<Subscription>;
  abstract findById(id: string): Promise<Subscription | null>;
  abstract findByUserId(userId: string): Promise<Subscription | null>;
  abstract findByUserIdAndStatus(
    userId: string,
    status: SubscriptionStatus,
  ): Promise<Subscription | null>;

  abstract findAll(opts: {
    page: number;
    limit: number;
    userId?: string;
    planId?: string;
    status?: SubscriptionStatus;
    sort?: 'createdAt' | 'updatedAt' | 'status';
    order?: 'ASC' | 'DESC';
  }): Promise<{ data: Subscription[]; total: number }>;
}
