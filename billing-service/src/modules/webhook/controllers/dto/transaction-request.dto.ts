import { PaymentMethod } from 'src/shared/enums/payment-method.enum';

export class TranscationRequestDto {
  constructor(
    public readonly subscriptionId: string,
    public readonly amount: number,
    public readonly customerId: string,
    public readonly paymentMethod: PaymentMethod,
    public readonly callbackUrl: string,
  ) {}
}
