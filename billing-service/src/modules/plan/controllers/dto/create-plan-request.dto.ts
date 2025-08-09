import {
  IsEnum,
  IsNotEmpty,
  IsString,
  IsNumber,
  IsArray,
  ArrayNotEmpty,
  IsOptional,
  IsInt,
  Min,
} from 'class-validator';
import { Cycle } from '../../domains/enums/cycle.enum';
import { PlanStatus } from '../../domains/enums/plan-status.enum';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreatePlanDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ example: 49.99, description: 'Plan price >= 0' })
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  price: number;

  @ApiProperty({ enum: Cycle })
  @IsEnum(Cycle)
  billingCycle: Cycle;

  @ApiProperty({
    type: [String],
    example: ['10 projects', 'Priority support'],
  })
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  features: string[];

  @ApiProperty({ enum: PlanStatus, default: PlanStatus.ACTIVE })
  @IsEnum(PlanStatus)
  status: PlanStatus;

  @ApiPropertyOptional({ minimum: 0, default: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  trialDays: number = 0;
}
