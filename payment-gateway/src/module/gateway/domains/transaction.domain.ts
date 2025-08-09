import { PaymentMethod } from 'src/shared/enums/payment-method.enum';
import { PaymentStatus } from 'src/shared/enums/payment-status.enum';

export class Transaction {
  constructor(
    public readonly transactionId: string,
    public readonly subscriptionId: string,
    public readonly amount: number,
    public readonly currency: string,
    public readonly customerId: string,
    public readonly paymentMethod: PaymentMethod,
    public readonly callbackUrl: string,
    public status: PaymentStatus = PaymentStatus.PROCESSING,
    public readonly createdAt: Date = new Date(),
  ) {}

  markStatus(status: PaymentStatus) {
    this.status = status;
  }
}
