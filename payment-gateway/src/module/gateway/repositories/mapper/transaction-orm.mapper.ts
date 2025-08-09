import { Transaction } from '../../domains/transaction.domain';
import { TransactionEntity } from '../entities/transaction.entity';

export class TransactionOrmMapper {
  static toDomain(entity: TransactionEntity): Transaction {
    return new Transaction(
      entity.id,
      entity.subscriptionId,
      entity.amount,
      entity.currency,
      entity.customerId,
      entity.paymentMethod,
      entity.callbackUrl,
      entity.status,
      entity.createdAt,
    );
  }

  static toEntity(domain: Transaction): TransactionEntity {
    const entity = new TransactionEntity();
    entity.id = domain.transactionId;
    entity.subscriptionId = domain.subscriptionId;
    entity.amount = domain.amount;
    entity.currency = domain.currency;
    entity.customerId = domain.customerId;
    entity.paymentMethod = domain.paymentMethod;
    entity.status = domain.status;
    entity.createdAt = domain.createdAt;
    entity.callbackUrl = domain.callbackUrl;
    return entity;
  }
}
