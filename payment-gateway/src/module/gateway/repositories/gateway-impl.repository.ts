import { InjectRepository } from '@nestjs/typeorm';
import { Injectable } from '@nestjs/common';
import { Transaction } from '../domains/transaction.domain';
import { GatewayRepository } from './ports/gateway.repository';
import { Repository } from 'typeorm';
import { TransactionEntity } from './entities/transaction.entity';
import { TransactionOrmMapper } from './mapper/transaction-orm.mapper';

@Injectable()
export class GatewayRepositoryImpl implements GatewayRepository {
  constructor(
    @InjectRepository(TransactionEntity)
    private readonly repo: Repository<TransactionEntity>,
  ) {}

  async save(trans: Transaction): Promise<Transaction> {
    const savedTrans = await this.repo.save(TransactionOrmMapper.toEntity(trans));
    return TransactionOrmMapper.toDomain(savedTrans);
  }

  async findById(id: string): Promise<Transaction | null> {
    const tran = await this.repo.findOne({ where: { id } });
    return tran ? TransactionOrmMapper.toDomain(tran) : null;
  }
}
