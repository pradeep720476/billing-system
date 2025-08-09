import { Cycle } from 'src/modules/plan/domains/enums/cycle.enum';
import { SubscriptionStatus } from './enums/subscription-status.enum';
import { BillingCycle } from 'src/modules/plan/domains/value-objects/billing-cycle.vo';

export class Subscription {
  constructor(
    public readonly id: string,
    public status: SubscriptionStatus,
    public autoRenew: boolean,
    public startDate: Date,
    public endDate: Date | null,
    public trialEndDate: Date | null,
    public cancelDate: Date | null,
    public userId: string | null,
    public planId: string | null,
  ) {}

  updateStatus(status: SubscriptionStatus) {
    this.status = status;
  }

  changePlan(newPlanId: string, newBillingCycle: BillingCycle) {
    this.planId = newPlanId;
    // Simple rule for assignment: reset the endDate to next cycle end.
    this.endDate = Subscription.calculateEndDate(newBillingCycle.cycle);
  }

  static calculateEndDate(billingCycle: Cycle): Date {
    const now = new Date();
    if (billingCycle === Cycle.MONTHLY) now.setMonth(now.getMonth() + 1);
    else now.setFullYear(now.getFullYear() + 1);
    return now;
  }

  static calculateTrialEndDate(days = 0): Date | null {
    if (!days || days <= 0) return null;
    const date = new Date();
    date.setDate(date.getDate() + days);
    return date;
  }

  activate() {
    this.status = SubscriptionStatus.ACTIVE;
  }

  cancel() {
    this.status = SubscriptionStatus.CANCELLED;
    this.cancelDate = new Date();
  }
}
