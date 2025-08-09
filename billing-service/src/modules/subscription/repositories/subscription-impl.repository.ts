import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SubscriptionRepository } from './subscription.repository';
import { SubscriptionEntity } from './entities/subscription.entity';
import { Subscription } from '../domains/subscription.domain';
import { SubscriptionOrmMapper } from './mappers/subscription-orm.mapper';
import { SubscriptionStatus } from '../domains/enums/subscription-status.enum';

@Injectable()
export class SubscriptionRepositoryImpl implements SubscriptionRepository {
  constructor(
    @InjectRepository(SubscriptionEntity)
    private readonly subRepo: Repository<SubscriptionEntity>,
  ) {}

  async save(sub: Subscription): Promise<Subscription> {
    const entity = SubscriptionOrmMapper.toEntity(sub);
    const saved = await this.subRepo.save(entity);
    return SubscriptionOrmMapper.toDomain(saved);
  }

  async findById(id: string): Promise<Subscription | null> {
    const entity = await this.subRepo.findOne({ where: { id } });
    return entity ? SubscriptionOrmMapper.toDomain(entity) : null;
  }

  async findByUserId(userId: string): Promise<Subscription | null> {
    const entity = await this.subRepo.findOne({
      where: { userId },
      order: { createdAt: 'DESC' }, // requires BaseEntity timestamps
    });
    return entity ? SubscriptionOrmMapper.toDomain(entity) : null;
  }

  async findByUserIdAndStatus(
    userId: string,
    status: SubscriptionStatus,
  ): Promise<Subscription | null> {
    const entity = await this.subRepo.findOne({
      where: { userId, status },
    });
    return entity ? SubscriptionOrmMapper.toDomain(entity) : null;
  }

  async findAll(opts: {
    page: number;
    limit: number;
    userId?: string;
    planId?: string;
    status?: SubscriptionStatus;
    sort?: 'createdAt' | 'updatedAt' | 'status';
    order?: 'ASC' | 'DESC';
  }): Promise<{ data: Subscription[]; total: number }> {
    const { page, limit, userId, planId, status, sort = 'createdAt', order = 'DESC' } = opts;
    const qb = this.subRepo.createQueryBuilder('s').where('1=1');

    if (userId) qb.andWhere('s.userId = :userId', { userId });
    if (planId) qb.andWhere('s.planId = :planId', { planId });
    if (status) qb.andWhere('s.status = :status', { status });

    qb.orderBy(`s.${sort}`, order)
      .skip((page - 1) * limit)
      .take(limit);

    const [rows, total] = await qb.getManyAndCount();
    return { data: rows.map(SubscriptionOrmMapper.toDomain), total };
  }
}
