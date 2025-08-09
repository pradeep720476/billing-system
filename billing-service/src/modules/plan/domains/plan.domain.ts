import { UpdatePlanDto } from '../controllers/dto/update-plan-request.dto';
import { PlanStatus } from './enums/plan-status.enum';
import { BillingCycle } from './value-objects/billing-cycle.vo';

export class Plan {
  constructor(
    public readonly id: string,
    public name: string,
    public price: number,
    public billingCycle: BillingCycle,
    public features: string[],
    public status: PlanStatus,
    public trialDays: number,
  ) {}

  activate() {
    this.status = PlanStatus.ACTIVE;
  }

  deactivate() {
    this.status = PlanStatus.INACTIVE;
  }

  updatePlan(plan: UpdatePlanDto) {
    if (plan.name) this.name = plan.name;
    if (plan.price) this.price = plan.price;
    if (plan.billingCycle) this.billingCycle = new BillingCycle(plan.billingCycle);
    if (plan.features) this.features = plan.features;
    if (plan.trialDays) this.trialDays = plan.trialDays;
  }

  isActive() {
    return this.status === PlanStatus.ACTIVE;
  }
}
