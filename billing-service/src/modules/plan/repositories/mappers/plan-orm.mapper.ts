import { Plan } from '../../domains/plan.domain';
import { BillingCycle } from '../../domains/value-objects/billing-cycle.vo';
import { PlanEntity } from '../entities/plan.entity';

export class PlanOrmMapper {
  static toEntity(domain: Plan): PlanEntity {
    const entity = new PlanEntity();
    entity.id = domain.id;
    entity.name = domain.name;
    entity.price = domain.price;
    entity.billingCycle = domain.billingCycle.cycle;
    entity.features = domain.features;
    entity.status = domain.status;
    entity.trialDays = domain.trialDays;
    return entity;
  }

  static toDomain(entity: PlanEntity): Plan {
    return new Plan(
      entity.id,
      entity.name,
      Number(entity.price),
      new BillingCycle(entity.billingCycle),
      entity.features,
      entity.status,
      entity.trialDays,
    );
  }
}
