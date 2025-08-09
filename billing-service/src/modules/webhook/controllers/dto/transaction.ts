import { ApiProperty } from '@nestjs/swagger';
import { IsUUID, IsEnum } from 'class-validator';
import { PaymentStatus } from 'src/shared/enums/payment-status.enum';

export class TransactionDto {
  @IsUUID()
  @ApiProperty()
  subscriptionId: string;

  @IsEnum(PaymentStatus)
  @ApiProperty({ enum: PaymentStatus })
  status: PaymentStatus;
}
