import { PaymentStatus } from 'src/shared/enums/payment-status.enum';

export abstract class WebhookAdapter {
  abstract sendTransactionResult(
    subscriptionId: string,
    status: PaymentStatus,
    url: string,
  ): Promise<void>;
}
