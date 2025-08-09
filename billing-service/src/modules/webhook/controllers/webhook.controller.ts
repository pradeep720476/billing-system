import { Body, HttpCode, HttpStatus, Patch, Post, UseGuards } from '@nestjs/common';
import { Controller } from '@nestjs/common/decorators/core/controller.decorator';
import { PaymentWebhookHandlerService } from '../services/payment-webhook-handler.service';
import { TransactionDto } from './dto/transaction';
import { Public } from 'src/shared/decorators/public.decorator';
import { WebhookSignatureGuard } from 'src/shared/guards/webhook-signature.guard';

@Controller('webhooks')
export class WebhookController {
  constructor(private readonly paymentService: PaymentWebhookHandlerService) {}

  @Public()
  @UseGuards(WebhookSignatureGuard)
  @Patch('payment')
  @HttpCode(HttpStatus.ACCEPTED)
  async handlePaymentWebhook(@Body() dto: TransactionDto) {
    await this.paymentService.handle(dto);
  }
}
