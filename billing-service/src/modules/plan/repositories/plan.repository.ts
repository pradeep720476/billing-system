import { PageResult } from 'src/shared/types/page-result.type';
import { Plan } from '../domains/plan.domain';
import { SearchPlansQuery } from '../controllers/dto/search-plans.query.dto';

export abstract class PlanRepository {
  abstract save(plan: Plan): Promise<Plan>;
  abstract findById(id: string): Promise<Plan | null>;
  abstract findAll(page?: number, limit?: number): Promise<PageResult<Plan>>;
  abstract upate(plan: Plan): Promise<Plan>;
  abstract deactivate(id: string): Promise<void>;
  abstract activate(id: string): Promise<void>;
  abstract search(query?: SearchPlansQuery): Promise<PageResult<Plan>>;
  abstract exists(id: string): Promise<boolean>;
}
