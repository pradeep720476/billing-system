import { PaymentMethod } from 'src/shared/enums/payment-method.enum';
import { PaymentStatus } from 'src/shared/enums/payment-status.enum';
import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('transactions')
export class TransactionEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  @Column({ name: 'subscription_id' })
  subscriptionId: string;
  @Column()
  amount: number;
  @Column({ default: 'AED' })
  currency: string;
  @Column({ name: 'customer_id' })
  customerId: string;
  @Column({ name: 'payment_method', type: 'enum', enum: PaymentMethod })
  paymentMethod: PaymentMethod;
  @Column({ type: 'enum', enum: PaymentStatus })
  status: PaymentStatus;
  @Column()
  callbackUrl: string;
  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;
}
