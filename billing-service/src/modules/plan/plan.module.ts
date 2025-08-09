import { Module } from '@nestjs/common';
import { PlanService } from './services/plan.service';
import { PlanRepository } from './repositories/plan.repository';
import { PlanRepositoryImpl } from './repositories/plan-impl.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PlanEntity } from './repositories/entities/plan.entity';
import { PlanController } from './controllers/plan.controller';

@Module({
  imports: [TypeOrmModule.forFeature([PlanEntity])],
  providers: [PlanService, { provide: PlanRepository, useClass: PlanRepositoryImpl }],
  controllers: [PlanController],
  exports: [PlanRepository],
})
export class PlanModule {}
