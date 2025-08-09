import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { GatewayService } from './services/gateway.service';
import { GatewayRepository } from './repositories/ports/gateway.repository';
import { GatewayRepositoryImpl } from './repositories/gateway-impl.repository';
import { GatewayController } from './controllers/gateway.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TransactionEntity } from './repositories/entities/transaction.entity';
import { HttpWebhookAdapter } from './repositories/adapters/http-webhook.adapter';
import { WebhookAdapter } from './repositories/ports/webhook.adapter';

@Module({
  imports: [HttpModule, TypeOrmModule.forFeature([TransactionEntity])],
  providers: [
    GatewayService,
    { provide: WebhookAdapter, useClass: HttpWebhookAdapter },
    { provide: GatewayRepository, useClass: GatewayRepositoryImpl },
  ],
  controllers: [GatewayController],
})
export class GatewayModule {}
