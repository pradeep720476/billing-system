import 'reflect-metadata';
import { Test, TestingModule } from '@nestjs/testing';
import { PaymentStatus } from 'src/shared/enums/payment-status.enum';
import { GatewayService } from 'src/module/gateway/services/gateway.service';
import { GatewayRepository } from 'src/module/gateway/repositories/ports/gateway.repository';
import { WebhookAdapter } from 'src/module/gateway/repositories/ports/webhook.adapter';

jest.mock('uuid', () => ({ v4: () => 'tx-uuid-1' }));

describe('GatewayService (unit)', () => {
  let service: GatewayService;

  const repoMock = {
    save: jest.fn(),
  };

  const webhookMock = {
    sendTransactionResult: jest.fn(),
  };

  const dto = {
    subscriptionId: 'sub-1',
    amount: 2500,
    customerId: 'u-1',
    paymentMethod: 'CARD',
    callbackUrl: 'http://billing-service:3002/api/webhooks/payment',
  };

  beforeEach(async () => {
    jest.resetAllMocks();
    // ⭐ Use modern fake timers so async timer helpers work
    jest.useFakeTimers({ legacyFakeTimers: false });

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GatewayService,
        { provide: GatewayRepository, useValue: repoMock },
        { provide: WebhookAdapter, useValue: webhookMock },
      ],
    }).compile();

    service = module.get(GatewayService);
  });

  afterEach(() => {
    jest.useRealTimers();
    try {
      (Math.random as unknown as jest.SpyInstance).mockRestore();
    } catch (error) {}
  });

  it('initate(): creates transaction, saves it, schedules finalize', async () => {
    repoMock.save.mockResolvedValue(undefined);

    const tx = await service.initate(dto as any);

    expect(repoMock.save).toHaveBeenCalledTimes(1);
    const saved = repoMock.save.mock.calls[0][0];

    expect(saved.subscriptionId).toBe('sub-1');
    expect(saved.amount).toBe(2500);
    expect(saved.currency).toBe('AED');
    expect(saved.customerId).toBe('u-1');
    expect(saved.paymentMethod).toBe('CARD');
    expect(saved.callbackUrl).toBe('http://billing-service:3002/api/webhooks/payment');

    expect(tx).toBe(saved);
  });

  it('finalizeTransaction: SUCCESS path', async () => {
    repoMock.save.mockResolvedValue(undefined);
    webhookMock.sendTransactionResult.mockResolvedValue(undefined);

    // Force success
    jest.spyOn(Math, 'random').mockReturnValue(0.9);

    await service.initate(dto as any);

    // ⏩ Let the 3s timer fire and finish any awaited work inside it
    await jest.advanceTimersByTimeAsync(3000);
    await Promise.resolve();

    expect(repoMock.save).toHaveBeenCalledTimes(2);
    const finalized = repoMock.save.mock.calls[1][0];

    expect(finalized.status).toBe(PaymentStatus.SUCCESS);

    expect(webhookMock.sendTransactionResult).toHaveBeenCalledWith(
      'sub-1',
      PaymentStatus.SUCCESS,
      'http://billing-service:3002/api/webhooks/payment',
    );
  });

  it('finalizeTransaction: FAILED path', async () => {
    repoMock.save.mockResolvedValue(undefined);
    webhookMock.sendTransactionResult.mockResolvedValue(undefined);

    // Force failure
    jest.spyOn(Math, 'random').mockReturnValue(0.1);

    await service.initate(dto as any);

    await jest.advanceTimersByTimeAsync(3000);
    await Promise.resolve();

    expect(repoMock.save).toHaveBeenCalledTimes(2);
    const finalized = repoMock.save.mock.calls[1][0];
    expect(finalized.status).toBe(PaymentStatus.FAILED);

    expect(webhookMock.sendTransactionResult).toHaveBeenCalledWith(
      'sub-1',
      PaymentStatus.FAILED,
      'http://billing-service:3002/api/webhooks/payment',
    );
  });
});
