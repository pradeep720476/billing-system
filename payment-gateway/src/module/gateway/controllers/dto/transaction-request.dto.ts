import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty } from 'class-validator';
import { PaymentMethod } from 'src/shared/enums/payment-method.enum';

export class TransactionRequestDto {
  @ApiProperty()
  @IsNotEmpty()
  subscriptionId: string;
  @IsNotEmpty()
  @ApiProperty()
  amount: number;
  @IsNotEmpty()
  @ApiProperty()
  customerId: string;
  @IsNotEmpty()
  @ApiProperty()
  @IsEnum(PaymentMethod)
  paymentMethod: PaymentMethod;
  @IsNotEmpty()
  @ApiProperty()
  callbackUrl: string;
}
