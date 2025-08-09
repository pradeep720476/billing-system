// src/modules/subscription/repositories/mappers/subscription-orm.mapper.ts
import { Subscription } from '../../domains/subscription.domain';
import { SubscriptionEntity } from '../entities/subscription.entity';

export class SubscriptionOrmMapper {
  static toDomain(entity: SubscriptionEntity): Subscription {
    return new Subscription(
      entity.id,
      entity.status,
      entity.autoRenew,
      entity.startDate,
      entity.endDate,
      entity.trialEndDate,
      entity.cancelDate,
      entity.userId ?? null,
      entity.planId ?? null,
    );
  }

  static toEntity(domain: Subscription): SubscriptionEntity {
    const entity = new SubscriptionEntity();
    entity.id = domain.id;
    entity.status = domain.status;
    entity.autoRenew = domain.autoRenew;
    entity.startDate = domain.startDate;
    entity.endDate = domain.endDate;
    entity.trialEndDate = domain.trialEndDate;
    entity.cancelDate = domain.cancelDate ?? null;
    entity.userId = domain.userId!;
    entity.planId = domain.planId!;
    return entity;
  }
}
