// test/modules/subscription/services/subscription.service.spec.ts
import 'reflect-metadata';
import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';

import { SubscriptionService } from 'src/modules/subscription/services/subscription.service';
import { SubscriptionRepository } from 'src/modules/subscription/repositories/subscription.repository';
import { UserRepository } from 'src/modules/user/repositories/user.respository';
import { PlanRepository } from 'src/modules/plan/repositories/plan.repository';
import { PaymentWebhookHandlerService } from 'src/modules/webhook/services/payment-webhook-handler.service';
import { ConfigService } from '@nestjs/config';

import { Subscription } from 'src/modules/subscription/domains/subscription.domain';
import { SubscriptionStatus } from 'src/modules/subscription/domains/enums/subscription-status.enum';
import { ENV_KEYS } from 'src/shared/types/env-keys';

// Make uuid deterministic for assertions
jest.mock('uuid', () => ({ v4: () => 'sub-uuid-1' }));

describe('SubscriptionService (unit)', () => {
  let service: SubscriptionService;

  const subRepoMock = {
    findById: jest.fn(),
    findByUserIdAndStatus: jest.fn(),
    save: jest.fn(),
  };

  const userRepoMock = {
    findById: jest.fn(),
    exists: jest.fn(),
  };

  const planRepoMock = {
    findById: jest.fn(),
  };

  const paymentSvcMock = {
    initiate: jest.fn(),
  };

  const configMock = {
    get: jest.fn(),
  };

  const fixedNow = new Date('2025-08-10T10:00:00.000Z');

  beforeAll(() => {
    jest.useFakeTimers().setSystemTime(fixedNow);
  });

  beforeEach(async () => {
    jest.resetAllMocks();

    configMock.get.mockImplementation((k: string) => {
      if (k === ENV_KEYS.CALL_BACK_URL) return 'http://billing-service:3002';
      if (k === ENV_KEYS.CALL_BACK_PAYMENT_PATH) return '/api/webhooks/payment';
      return undefined as any;
    });

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SubscriptionService,
        { provide: SubscriptionRepository, useValue: subRepoMock },
        { provide: UserRepository, useValue: userRepoMock },
        { provide: PlanRepository, useValue: planRepoMock },
        { provide: PaymentWebhookHandlerService, useValue: paymentSvcMock },
        { provide: ConfigService, useValue: configMock },
      ],
    }).compile();

    service = module.get(SubscriptionService);
  });

  describe('create', () => {
    let calcEndSpy: jest.SpiedFunction<typeof Subscription.calculateEndDate>;
    let calcTrialSpy: jest.SpiedFunction<typeof Subscription.calculateTrialEndDate>;

    beforeEach(() => {
      calcEndSpy = jest
        .spyOn(Subscription, 'calculateEndDate')
        .mockReturnValue(new Date('2025-09-10T10:00:00.000Z'));

      calcTrialSpy = jest
        .spyOn(Subscription, 'calculateTrialEndDate')
        .mockImplementation((days: number) => {
          const d = new Date(fixedNow);
          d.setDate(d.getDate() + days);
          return d;
        });
    });

    it('throws NotFound when user does not exist', async () => {
      userRepoMock.findById.mockResolvedValue(null);

      await expect(
        service.create('u-1', { planId: 'p-1', paymentMethod: 'CARD' } as any),
      ).rejects.toBeInstanceOf(NotFoundException);
    });

    it('creates TRIAL subscription when trialDays > 0, initiates payment, and saves', async () => {
      userRepoMock.findById.mockResolvedValue({ id: 'u-1' });
      const plan = {
        id: 'p-basic',
        price: 1999,
        isActive: () => true,
        billingCycle: { cycle: 'MONTHLY' },
      };
      planRepoMock.findById.mockResolvedValue(plan);
      subRepoMock.findByUserIdAndStatus.mockResolvedValue(null);
      subRepoMock.save.mockImplementation(async (s) => s);

      const dto = {
        planId: 'p-basic',
        paymentMethod: 'CARD',
        autoRenew: true,
        trialDays: 7,
      } as any;
      const created = await service.create('u-1', dto);
      expect(created.status).toBe(SubscriptionStatus.TRIAL);
      expect(calcEndSpy).toHaveBeenCalledWith('MONTHLY');
      expect(calcTrialSpy).toHaveBeenCalledWith(7);
      expect(paymentSvcMock.initiate).toHaveBeenCalledTimes(1);
      const arg = paymentSvcMock.initiate.mock.calls[0][0];
      expect(arg).toBeDefined();
      expect(configMock.get).toHaveBeenCalledWith(ENV_KEYS.CALL_BACK_URL);
      expect(configMock.get).toHaveBeenCalledWith(ENV_KEYS.CALL_BACK_PAYMENT_PATH);
      expect(subRepoMock.save).toHaveBeenCalledTimes(1);
      expect(created.id).toBe('sub-uuid-1');
      expect(created.userId).toBe('u-1');
      expect(created.planId).toBe('p-basic');
      expect(created.startDate.toISOString()).toBe(fixedNow.toISOString());
      expect(created.endDate?.toISOString()).toBe('2025-09-10T10:00:00.000Z');
    });

    it('creates PENDING subscription when no trialDays, initiates payment, and saves', async () => {
      userRepoMock.findById.mockResolvedValue({ id: 'u-1' });
      const plan = {
        id: 'p-basic',
        price: 1999,
        isActive: () => true,
        billingCycle: { cycle: 'MONTHLY' },
      };
      planRepoMock.findById.mockResolvedValue(plan);
      subRepoMock.findByUserIdAndStatus.mockResolvedValue(null);
      subRepoMock.save.mockImplementation(async (s) => s);

      const dto = { planId: 'p-basic', paymentMethod: 'CARD' } as any;
      const created = await service.create('u-1', dto);

      expect(created.status).toBe(SubscriptionStatus.PENDING);
      expect(paymentSvcMock.initiate).toHaveBeenCalledTimes(1);
      expect(subRepoMock.save).toHaveBeenCalledTimes(1);
    });
  });

  describe('cancel', () => {
    it('throws NotFound when subscription does not exist', async () => {
      subRepoMock.findById.mockResolvedValue(null);
      await expect(service.cancel('sub-x')).rejects.toBeInstanceOf(NotFoundException);
    });

    it('calls domain cancel() and saves', async () => {
      const sub: any = { id: 'sub-1', cancel: jest.fn() };
      subRepoMock.findById.mockResolvedValue(sub);
      subRepoMock.save.mockImplementation(async (s) => ({
        ...s,
        status: SubscriptionStatus.CANCELLED,
      }));

      const out = await service.cancel('sub-1');

      expect(sub.cancel).toHaveBeenCalledTimes(1);
      expect(subRepoMock.save).toHaveBeenCalledWith(sub);
      expect(out.status).toBe(SubscriptionStatus.CANCELLED);
    });
  });
});
