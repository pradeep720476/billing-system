import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { PlanService } from '../services/plan.service';
import { PlanResponseDto } from './dto/plan-response.dto';
import { PlanMapper } from './mappers/plan-mappers';
import { CreatePlanDto } from './dto/create-plan-request.dto';
import { PageResult } from 'src/shared/types/page-result.type';
import { Public } from 'src/shared/decorators/public.decorator';
import { Roles } from 'src/shared/decorators/role.decorators';
import { RoleType } from 'src/shared/enums/role-type.enum';
import { ApiOperation } from '@nestjs/swagger';
import { SearchPlansQuery } from './dto/search-plans.query.dto';

@Controller('plans')
export class PlanController {
  constructor(private readonly planService: PlanService) {}

  @Public()
  @ApiOperation({
    summary: 'Search plans (filter/sort/paginate)',
    security: [],
    description: 'Supports filters like name, billingCycle, status, price range',
  })
  @HttpCode(HttpStatus.OK)
  @Get('search')
  async search(@Query() q: SearchPlansQuery): Promise<PageResult<PlanResponseDto>> {
    const { items, total } = await this.planService.search(q);
    return {
      page: q.page,
      limit: q.limit,
      total,
      totalPages: Math.ceil(total / q.limit),
      items: items.map(PlanMapper.toResponseDto),
    } as PageResult<PlanResponseDto>;
  }

  @Public()
  @ApiOperation({ summary: 'Get plan by id' })
  @HttpCode(HttpStatus.OK)
  @Get(':id')
  async getPlan(@Param('id', ParseUUIDPipe) id: string): Promise<PlanResponseDto> {
    const plan = await this.planService.findPlan(id);
    return PlanMapper.toResponseDto(plan);
  }

  @Roles(RoleType.ADMIN)
  @ApiOperation({ summary: 'Create a plan (admin)' })
  @HttpCode(HttpStatus.CREATED)
  @Post()
  async createPlan(@Body() plan: CreatePlanDto): Promise<PlanResponseDto> {
    const createdPlan = await this.planService.createPlan(plan);
    return PlanMapper.toResponseDto(createdPlan);
  }

  @Roles(RoleType.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Activate a plan (admin)' })
  @Patch(':id/activate')
  async activate(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    await this.planService.activate(id);
  }

  @Roles(RoleType.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Deactivate a plan (admin)' })
  @Patch(':id/deactivate')
  async deactivate(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    await this.planService.deactivate(id);
  }
}
