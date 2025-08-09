import { Plan } from '../../domains/plan.domain';
import { PlanResponseDto } from '../dto/plan-response.dto';

export class PlanMapper {
  static toResponseDto(plan: Plan): PlanResponseDto {
    return {
      id: plan.id,
      name: plan.name,
      price: plan.price,
      billingCycle: plan.billingCycle.cycle,
      features: plan.features,
      status: plan.status,
      trialDays: plan.trialDays,
    };
  }
}
