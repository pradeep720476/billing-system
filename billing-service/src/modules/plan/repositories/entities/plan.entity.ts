import { Column, Entity, Index } from 'typeorm';
import { PlanStatus } from '../../domains/enums/plan-status.enum';
import { BaseEntity } from 'src/shared/entities/base.entity';
import { Cycle } from '../../domains/enums/cycle.enum';

@Entity('plans')
@Index('idx_plans_status', ['status'])
@Index('idx_plans_cycle', ['billingCycle'])
export class PlanEntity extends BaseEntity {
  @Column({ length: 120, unique: true })
  name!: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price!: number;

  @Column({ name: 'billing_cycle', type: 'enum', enum: Cycle })
  billingCycle!: Cycle;

  @Column({ type: 'text', array: true, nullable: true })
  features!: string[];

  @Column({ type: 'enum', enum: PlanStatus, default: PlanStatus.ACTIVE })
  status!: PlanStatus;

  @Column({ name: 'trial_days', type: 'int', default: 0 })
  trialDays!: number;
}
