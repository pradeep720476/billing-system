import { IsBoolean, IsEnum, IsInt, IsNotEmpty, IsOptional, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { PaymentMethod } from '../../../../shared/enums/payment-method.enum';
import { MMDDYYYYDate } from 'src/shared/decorators/mmddyyyy.decorator';

export class CreateSubscriptionRequestDto {
  @ApiProperty()
  @IsBoolean()
  autoRenew: boolean;

  @MMDDYYYYDate()
  @ApiProperty({ type: String, example: '08252025', description: 'MMDDYYYY' })
  startDate: Date;

  @ApiPropertyOptional({ required: false, minimum: 0, description: 'Trial days (optional)' })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Type(() => Number)
  trialDays?: number;

  @ApiProperty()
  @IsNotEmpty()
  planId: string;

  @ApiProperty({ enum: PaymentMethod })
  @IsNotEmpty()
  @IsEnum(PaymentMethod)
  paymentMethod: PaymentMethod;
}
