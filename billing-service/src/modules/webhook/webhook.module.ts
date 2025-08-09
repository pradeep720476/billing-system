import { forwardRef, Module } from '@nestjs/common';
import { PaymentWebhookHandlerService } from './services/payment-webhook-handler.service';
import { SubscriptionModule } from '../subscription/subscription.module';
import { HttpModule } from '@nestjs/axios';
import { WebhookController } from './controllers/webhook.controller';
import { PlanModule } from '../plan/plan.module';

@Module({
  imports: [forwardRef(() => SubscriptionModule), HttpModule, PlanModule],
  providers: [PaymentWebhookHandlerService],
  controllers: [WebhookController],
  exports: [PaymentWebhookHandlerService],
})
export class WebhookModule {}
