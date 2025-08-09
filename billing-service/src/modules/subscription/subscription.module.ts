import { TypeOrmModule } from '@nestjs/typeorm';
import { SubscriptionEntity } from './repositories/entities/subscription.entity';
import { Module } from '@nestjs/common';
import { SubscriptionController } from './controllers/subscription.controller';
import { SubscriptionService } from './services/subscription.service';
import { SubscriptionRepository } from './repositories/subscription.repository';
import { SubscriptionRepositoryImpl } from './repositories/subscription-impl.repository';
import { UserModule } from '../user/user.module';
import { PlanModule } from '../plan/plan.module';
import { WebhookModule } from '../webhook/webhook.module';

@Module({
  imports: [TypeOrmModule.forFeature([SubscriptionEntity]), UserModule, PlanModule, WebhookModule],
  controllers: [SubscriptionController],
  providers: [
    SubscriptionService,
    { provide: SubscriptionRepository, useClass: SubscriptionRepositoryImpl },
  ],
  exports: [SubscriptionRepository],
})
export class SubscriptionModule {}
