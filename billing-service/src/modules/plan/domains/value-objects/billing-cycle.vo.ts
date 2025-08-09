import { Cycle } from '../enums/cycle.enum';

export class BillingCycle {
  public static readonly cycles: Cycle[] = [Cycle.MONTHLY, Cycle.YEARLY, Cycle.QUATERLY];

  constructor(public readonly cycle: Cycle) {
    if (!BillingCycle.cycles.includes(cycle)) {
      throw new Error(`Invalid billing cycle: ${cycle}`);
    }
  }
}
