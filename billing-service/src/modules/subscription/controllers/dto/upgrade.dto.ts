import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class UpgradeDto {
  @ApiProperty()
  @IsUUID()
  planId: string;
}
