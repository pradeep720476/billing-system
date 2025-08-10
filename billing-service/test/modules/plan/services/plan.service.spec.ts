import 'reflect-metadata';
import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';

import { PlanService } from 'src/modules/plan/services/plan.service';
import { PlanRepository } from 'src/modules/plan/repositories/plan.repository';

jest.mock('uuid', () => ({ v4: () => 'plan-uuid-1' }));

describe('PlanService', () => {
  let service: PlanService;

  const planRepoMock = {
    save: jest.fn(),
    findById: jest.fn(),
    findAll: jest.fn(),
    upate: jest.fn(),
    deactivate: jest.fn(),
    activate: jest.fn(),
    exists: jest.fn(),
    search: jest.fn(),
  };

  beforeEach(async () => {
    jest.resetAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [PlanService, { provide: PlanRepository, useValue: planRepoMock }],
    }).compile();

    service = module.get(PlanService);
  });

  describe('createPlan', () => {
    it('constructs Plan with BillingCycle and saves it', async () => {
      planRepoMock.save.mockImplementation(async (p) => p);

      const dto = {
        name: 'Basic',
        price: 1999,
        billingCycle: 'MONTHLY',
        features: ['f1', 'f2'],
        status: 'ACTIVE',
        trialDays: 14,
      } as any;

      const created = await service.createPlan(dto);

      expect(planRepoMock.save).toHaveBeenCalledTimes(1);
      const saved = planRepoMock.save.mock.calls[0][0];

      expect(saved.id).toBe('plan-uuid-1');
      expect(saved.name).toBe('Basic');
      expect(saved.price).toBe(1999);
      expect(created).toBe(saved);
    });
  });

  describe('deactivate', () => {
    it('throws NotFound when plan does not exist', async () => {
      planRepoMock.exists.mockResolvedValue(false);
      await expect(service.deactivate('p1')).rejects.toBeInstanceOf(NotFoundException);
    });
  });

  describe('activate', () => {
    it('calls repo.activate for existing plan', async () => {
      planRepoMock.exists.mockResolvedValue(true);
      await service.activate('p1');
      expect(planRepoMock.activate).toHaveBeenCalledWith('p1');
    });
  });
});
