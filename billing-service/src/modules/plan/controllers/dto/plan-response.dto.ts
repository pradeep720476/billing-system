import { ApiProperty } from '@nestjs/swagger';
import { PlanStatus } from '../../domains/enums/plan-status.enum';

export class PlanResponseDto {
  @ApiProperty()
  id: string;
  @ApiProperty()
  name: string;
  @ApiProperty()
  price: number;
  @ApiProperty()
  billingCycle: string;
  @ApiProperty()
  features: string[];
  @ApiProperty()
  status: PlanStatus;
  @ApiProperty()
  trialDays?: number;
}
