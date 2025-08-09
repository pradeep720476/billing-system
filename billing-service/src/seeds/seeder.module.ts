import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SeederService } from './seeder.service';
import { UserEntity } from 'src/modules/user/repositories/entities/user.entity';
import { RoleEntity } from 'src/modules/role/repositories/entities/role.entity';
import { PlanEntity } from 'src/modules/plan/repositories/entities/plan.entity';
import { SubscriptionEntity } from 'src/modules/subscription/repositories/entities/subscription.entity';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([UserEntity, RoleEntity, PlanEntity, SubscriptionEntity]),
  ],
  providers: [SeederService],
  exports: [SeederService],
})
export class SeederModule {}
