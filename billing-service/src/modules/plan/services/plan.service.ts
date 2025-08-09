import { Injectable, NotFoundException } from '@nestjs/common';
import { PlanRepository } from '../repositories/plan.repository';
import { CreatePlanDto } from '../controllers/dto/create-plan-request.dto';
import { Plan } from '../domains/plan.domain';
import { v4 as uuidv4 } from 'uuid';
import { BillingCycle } from '../domains/value-objects/billing-cycle.vo';
import { PageResult } from 'src/shared/types/page-result.type';
import { UpdatePlanDto } from '../controllers/dto/update-plan-request.dto';
import { SearchPlansQuery } from '../controllers/dto/search-plans.query.dto';

@Injectable()
export class PlanService {
  constructor(private readonly planRepo: PlanRepository) {}

  async createPlan(dto: CreatePlanDto): Promise<Plan> {
    const plan = new Plan(
      uuidv4(),
      dto.name,
      dto.price,
      new BillingCycle(dto.billingCycle),
      dto.features,
      dto.status,
      dto.trialDays,
    );
    return await this.planRepo.save(plan);
  }

  async findPlan(id: string): Promise<Plan> {
    const plan = await this.planRepo.findById(id);
    if (!plan) throw new NotFoundException(`plan not found for given id`);
    return plan;
  }

  async findAll(page?: number, limit?: number): Promise<PageResult<Plan>> {
    return await this.planRepo.findAll(page, limit);
  }

  async update(id: string, dto: UpdatePlanDto): Promise<Plan> {
    const existing = await this.planRepo.findById(id);
    if (!existing) throw new NotFoundException('Plan not found');
    existing.updatePlan(dto);
    return this.planRepo.upate(existing);
  }

  async deactivate(id: string): Promise<void> {
    const exist = await this.planRepo.exists(id);
    if (!exist) throw new NotFoundException('No Plan exists to deactivate');
    await this.planRepo.deactivate(id);
  }

  async activate(id: string): Promise<void> {
    const exist = await this.planRepo.exists(id);
    if (!exist) throw new NotFoundException('No Plan exists to activate');
    await this.planRepo.activate(id);
  }

  async search(query?: SearchPlansQuery): Promise<PageResult<Plan>> {
    return await this.planRepo.search(query);
  }
}
