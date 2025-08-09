import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { TransactionRequestDto } from './dto/transaction-request.dto';
import { GatewayService } from '../services/gateway.service';
import { TransasctionReponseDto } from './dto/transaction-response.dto';
import { APIKeyAuthGuard } from 'src/shared/guards/apikey-auth.guard';

@UseGuards(APIKeyAuthGuard)
@Controller()
export class GatewayController {
  constructor(private readonly gatewayService: GatewayService) {}

  @Post('initiate')
  async initiate(@Body() transacstionDto: TransactionRequestDto) {
    const transaction = await this.gatewayService.initate(transacstionDto);
    return new TransasctionReponseDto(transaction.transactionId);
  }
}
