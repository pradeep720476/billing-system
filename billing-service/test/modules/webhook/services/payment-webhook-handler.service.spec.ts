import 'reflect-metadata';
import { Test, TestingModule } from '@nestjs/testing';
import { of } from 'rxjs';
import { PaymentWebhookHandlerService } from 'src/modules/webhook/services/payment-webhook-handler.service';
import { SubscriptionRepository } from 'src/modules/subscription/repositories/subscription.repository';
import { PlanRepository } from 'src/modules/plan/repositories/plan.repository';
import { SubscriptionStatus } from 'src/modules/subscription/domains/enums/subscription-status.enum';
import { PaymentStatus } from 'src/shared/enums/payment-status.enum';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { ENV_KEYS } from 'src/shared/types/env-keys';

describe('PaymentWebhookHandlerService (unit)', () => {
  let service: PaymentWebhookHandlerService;

  const subRepoMock = {
    findById: jest.fn(),
    save: jest.fn(),
  };

  const planRepoMock = {
    findById: jest.fn(),
  };

  const httpMock = {
    post: jest.fn(),
  };

  const configMock = {
    get: jest.fn(),
  };

  beforeEach(async () => {
    jest.resetAllMocks();

    configMock.get.mockImplementation((k: string) => {
      switch (k) {
        case ENV_KEYS.PAYMENT_GATEWAY_URL:
          return 'http://payment-gateway:3001/v1/';
        case ENV_KEYS.PAYMENT_INITIATE_PATH:
          return '/payments/initiate';
        case ENV_KEYS.PAYMENT_GATEWAY_API_KEY:
          return 'secret_gateway_key@123';
        default:
          return undefined;
      }
    });

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PaymentWebhookHandlerService,
        { provide: SubscriptionRepository, useValue: subRepoMock },
        { provide: PlanRepository, useValue: planRepoMock },
        { provide: HttpService, useValue: httpMock },
        { provide: ConfigService, useValue: configMock },
      ],
    }).compile();

    service = module.get(PaymentWebhookHandlerService);
  });

  describe('handle()', () => {
    it('SUCCESS with missing plan: sets ACTIVE and saves without endDate calc', async () => {
      const sub: any = {
        id: 's1',
        status: SubscriptionStatus.PENDING,
        planId: 'p-missing',
        updateStatus: jest.fn(function (st: SubscriptionStatus) {
          this.status = st;
        }),
      };
      subRepoMock.findById.mockResolvedValue(sub);
      planRepoMock.findById.mockResolvedValue(null);
      subRepoMock.save.mockImplementation(async (s) => s);
      await service.handle({ subscriptionId: 's1', status: PaymentStatus.SUCCESS } as any);
      expect(sub.updateStatus).toHaveBeenCalledWith(SubscriptionStatus.ACTIVE);
      expect(planRepoMock.findById).toHaveBeenCalledWith('p-missing');
    });
  });

  describe('initiate()', () => {
    it('posts to gateway with Bearer token and payload', async () => {
      httpMock.post.mockReturnValue(of({ data: { ok: true } }));

      const dto = {
        subscriptionId: 's1',
        amount: 1999,
        userId: 'u1',
        paymentMethod: 'CARD',
        callbackUrl: 'http://billing-service:3002/api/webhooks/payment',
      };

      await service.initiate(dto as any);

      const [[url, body, opts]] = httpMock.post.mock.calls;
      expect(body).toMatchObject(dto);
      expect(opts).toMatchObject({
        headers: { Authorization: 'Bearer secret_gateway_key@123' },
        timeout: 5000,
      });
    });
  });
});
