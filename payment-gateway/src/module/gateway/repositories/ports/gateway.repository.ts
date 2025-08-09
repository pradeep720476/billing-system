import { Transaction } from '../../domains/transaction.domain';

export abstract class GatewayRepository {
  abstract save(trans: Transaction): Promise<Transaction>;
  abstract findById(id: string): Promise<Transaction | null>;
}
