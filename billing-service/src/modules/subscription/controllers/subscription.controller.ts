import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Req,
} from '@nestjs/common';
import { SubscriptionService } from '../services/subscription.service';
import { CreateSubscriptionRequestDto } from './dto/create-subscription-request.dto';
import { AuthenticatedRequest } from './dto/user.dto';
import { UpgradeDto } from './dto/upgrade.dto';
import { SubscriptionMapper } from './mapper/subscription.mapper';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Roles } from 'src/shared/decorators/role.decorators';
import { RoleType } from 'src/shared/enums/role-type.enum';

@Controller('subscriptions')
export class SubscriptionController {
  constructor(private readonly subscriptionService: SubscriptionService) {}

  @Get('me')
  @Roles(RoleType.CUSTOMER)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get active subscription' })
  async me(@Req() req: AuthenticatedRequest) {
    const userId = req.user.id;
    return SubscriptionMapper.toResponseDto(
      await this.subscriptionService.findSubscriptionByUserId(userId),
    );
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create/subscribe to a plan' })
  @ApiResponse({ status: 202, description: 'Created (PENDING/TRIAL), payment in progress' })
  async subscribe(@Req() req: AuthenticatedRequest, @Body() dto: CreateSubscriptionRequestDto) {
    const userId = req.user.id;
    return SubscriptionMapper.toResponseDto(await this.subscriptionService.create(userId, dto));
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get subscription by id' })
  async get(@Param('id', ParseUUIDPipe) id: string) {
    return SubscriptionMapper.toResponseDto(await this.subscriptionService.findById(id));
  }

  @Patch('change-plan')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Change/upgrade current active subscription for the user' })
  async changePlan(@Req() req: AuthenticatedRequest, @Body() dto: UpgradeDto) {
    const userId = req.user.id;
    return SubscriptionMapper.toResponseDto(
      await this.subscriptionService.upgrade(userId, dto.planId),
    );
  }

  @Patch(':id/cancel')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Cancel a subscription' })
  async cancel(@Param('id', ParseUUIDPipe) id: string) {
    return SubscriptionMapper.toResponseDto(await this.subscriptionService.cancel(id));
  }
}
