import { Subscription } from '../../domains/subscription.domain';
import { SubscriptionResponseDto } from '../dto/subscription-response.dto';

export class SubscriptionMapper {
  static toResponseDto(subscription: Subscription): SubscriptionResponseDto {
    const dto = new SubscriptionResponseDto();
    dto.id = subscription.id;
    dto.planId = subscription.planId;
    dto.userId = subscription.userId;
    dto.status = subscription.status;
    dto.autoRenew = subscription.autoRenew;
    dto.startDate = subscription.startDate;
    dto.endDate = subscription.endDate ?? null;
    return dto;
  }
}
