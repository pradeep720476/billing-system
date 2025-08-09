import { Injectable } from '@nestjs/common';
import { GatewayRepository } from '../repositories/ports/gateway.repository';
import { TransactionRequestDto } from '../controllers/dto/transaction-request.dto';
import { Transaction } from '../domains/transaction.domain';
import { v4 as uuidv4 } from 'uuid';
import { PaymentStatus } from 'src/shared/enums/payment-status.enum';
import { WebhookAdapter } from '../repositories/ports/webhook.adapter';

@Injectable()
export class GatewayService {
  constructor(
    private readonly gatewayRepo: GatewayRepository,
    private readonly webhook: WebhookAdapter,
  ) {}

  async initate(dto: TransactionRequestDto): Promise<Transaction> {
    const transaction = new Transaction(
      uuidv4(),
      dto.subscriptionId,
      dto.amount,
      'AED',
      dto.customerId,
      dto.paymentMethod,
      dto.callbackUrl,
    );
    console.log('transaction', transaction);
    await this.gatewayRepo.save(transaction);
    setTimeout(() => {
      void this.finalizeTransaction(transaction);
    }, 3000);

    setTimeout(async () => {}, 3000);
    return transaction;
  }

  private async finalizeTransaction(transaction: Transaction): Promise<void> {
    try {
      if (Math.random() > 0.5) transaction.markStatus(PaymentStatus.SUCCESS);
      else transaction.markStatus(PaymentStatus.FAILED);
      console.log('sending back transaction', transaction);
      await this.gatewayRepo.save(transaction);
      await this.webhook.sendTransactionResult(
        transaction.subscriptionId,
        transaction.status,
        transaction.callbackUrl,
      );
    } catch (err) {
      console.log(err);
    }
  }
}
