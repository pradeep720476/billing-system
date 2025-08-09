import { Column, Entity, Index, JoinColumn, ManyToOne, RelationId } from 'typeorm';
import { SubscriptionStatus } from '../../domains/enums/subscription-status.enum';
import { BaseEntity } from 'src/shared/entities/base.entity';
import { UserEntity } from 'src/modules/user/repositories/entities/user.entity';
import { PlanEntity } from 'src/modules/plan/repositories/entities/plan.entity';

@Entity('subscriptions')
@Index('idx_sub_user_status', ['userId', 'status'])
@Index('idx_sub_plan', ['planId'])
export class SubscriptionEntity extends BaseEntity {
  @ManyToOne(() => UserEntity, { eager: true, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'user_id' })
  user: UserEntity | null;

  @Column({ name: 'user_id', type: 'uuid' })
  userId!: string;

  @ManyToOne(() => PlanEntity, { eager: true, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'plan_id' })
  plan: PlanEntity | null;

  @RelationId((s: SubscriptionEntity) => s.plan)
  @Column({ name: 'plan_id', type: 'uuid' })
  planId!: string;

  @Column({ type: 'enum', enum: SubscriptionStatus, default: SubscriptionStatus.PENDING })
  status!: SubscriptionStatus;

  @Column({ name: 'start_date', type: 'timestamptz', default: () => 'now()' })
  startDate!: Date;

  @Column({ name: 'end_date', type: 'timestamptz', nullable: true })
  endDate!: Date | null;

  @Column({ type: 'timestamptz', nullable: true })
  cancelDate!: Date | null;

  @Column({ type: 'timestamptz', nullable: true })
  trialEndDate!: Date | null;

  @Column({ name: 'auto_renew', type: 'boolean', default: false })
  autoRenew!: boolean;
}
