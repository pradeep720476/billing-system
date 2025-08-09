import { Repository } from 'typeorm';
import { Plan } from '../domains/plan.domain';
import { PlanRepository } from './plan.repository';
import { PlanEntity } from './entities/plan.entity';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PlanOrmMapper } from './mappers/plan-orm.mapper';
import { PageResult } from 'src/shared/types/page-result.type';
import { PlanStatus } from '../domains/enums/plan-status.enum';
import { SearchPlansQuery } from '../controllers/dto/search-plans.query.dto';

@Injectable()
export class PlanRepositoryImpl implements PlanRepository {
  constructor(
    @InjectRepository(PlanEntity)
    private readonly repo: Repository<PlanEntity>,
  ) {}

  async search(query: SearchPlansQuery): Promise<PageResult<Plan>> {
    const qb = this.repo.createQueryBuilder('plan');
    if (query?.name) {
      qb.andWhere('plan.name ILIKE :name', { name: `%${query.name}%` });
    }
    if (query?.billingCycle) {
      qb.andWhere('plan.billingCycle = :billingCycle', {
        billingCycle: query.billingCycle,
      });
    }
    if (query?.status) {
      qb.andWhere('plan.status = :status', { status: query.status });
    }
    if (query?.minPrice) {
      qb.andWhere('plan.price >= :minPrice', { minPrice: query.minPrice });
    }
    if (query?.maxPrice) {
      qb.andWhere('plan.price <= :maxPrice', { maxPrice: query.maxPrice });
    }

    if (query?.sortBy) {
      qb.orderBy(`plan.${query.sortBy}`, query.sortOrder || 'ASC');
    }

    qb.skip((query.page - 1) * query.limit).take(query.limit);
    const [plans, total] = await qb.getManyAndCount();
    return { total, items: plans.map(PlanOrmMapper.toDomain) };
  }

  async save(plan: Plan): Promise<Plan> {
    const planEntity = PlanOrmMapper.toEntity(plan);
    const savedPlan = await this.repo.save(planEntity);
    return PlanOrmMapper.toDomain(savedPlan);
  }

  async findById(id: string): Promise<Plan | null> {
    const plan = await this.repo.findOne({ where: { id } });
    return plan ? PlanOrmMapper.toDomain(plan) : plan;
  }

  async findAll(page: number = 1, limit: number = 20): Promise<PageResult<Plan>> {
    const [plans, total] = await this.repo.findAndCount({
      skip: (page - 1) * limit,
      take: limit,
    });
    return { total, items: plans.map(PlanOrmMapper.toDomain) };
  }

  async upate(plan: Plan): Promise<Plan> {
    const updatedPlan = await this.repo.save(PlanOrmMapper.toEntity(plan));
    return PlanOrmMapper.toDomain(updatedPlan);
  }

  async deactivate(id: string): Promise<void> {
    await this.repo.update(id, { status: PlanStatus.INACTIVE });
  }

  async activate(id: string): Promise<void> {
    await this.repo.update(id, { status: PlanStatus.ACTIVE });
  }

  async exists(id: string): Promise<boolean> {
    return await this.repo.exists({ where: { id } });
  }
}
