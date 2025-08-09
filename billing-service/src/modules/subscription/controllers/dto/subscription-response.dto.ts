import { ApiProperty } from '@nestjs/swagger';
import { SubscriptionStatus } from '../../domains/enums/subscription-status.enum';

export class SubscriptionResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  userId: string | null;

  @ApiProperty()
  planId: string | null;

  @ApiProperty()
  status: SubscriptionStatus;

  @ApiProperty()
  autoRenew: boolean;

  @ApiProperty()
  startDate: Date;

  @ApiProperty()
  endDate: Date | null;
}
