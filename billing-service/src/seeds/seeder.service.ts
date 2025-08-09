// src/seeds/seeder.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcryptjs';
import { v4 as uuid4 } from 'uuid';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';

import { Cycle } from 'src/modules/plan/domains/enums/cycle.enum';
import { PlanStatus } from 'src/modules/plan/domains/enums/plan-status.enum';
import { PlanEntity } from 'src/modules/plan/repositories/entities/plan.entity';
import { RoleEntity } from 'src/modules/role/repositories/entities/role.entity';
import { SubscriptionStatus } from 'src/modules/subscription/domains/enums/subscription-status.enum';
import { SubscriptionEntity } from 'src/modules/subscription/repositories/entities/subscription.entity';
import { UserEntity } from 'src/modules/user/repositories/entities/user.entity';
import { RoleType } from 'src/shared/enums/role-type.enum';
import { ENV_KEYS } from 'src/shared/types/env-keys';

@Injectable()
export class SeederService {
  constructor(
    @InjectRepository(UserEntity) private userRepo: Repository<UserEntity>,
    @InjectRepository(PlanEntity) private planRepo: Repository<PlanEntity>,
    @InjectRepository(SubscriptionEntity) private subscriptionRepo: Repository<SubscriptionEntity>,
    @InjectRepository(RoleEntity) private roleRepo: Repository<RoleEntity>,
    private readonly config: ConfigService,
  ) {}

  async run() {
    if (process.env.RUN_SEED !== 'true') return;
    console.log('Seeding started...');
    await this.seedRoles();
    await this.seedUsers();
    await this.seedPlans();
    await this.seedSubscriptions();
    console.log('Seeding completed!');
  }

  private async seedRoles() {
    const exists = await this.roleRepo.exists();
    if (exists) return;
    await this.roleRepo.insert([
      {
        id: uuid4(),
        name: 'ADMIN',
        code: RoleType.ADMIN,
        description: 'Can manage plans and users',
        createdBy: 'seed',
        updatedBy: 'seed',
      },
      {
        id: uuid4(),
        name: 'CUSTOMER',
        code: RoleType.CUSTOMER,
        description: 'Can subscribe to plans',
        createdBy: 'seed',
        updatedBy: 'seed',
      },
      {
        id: uuid4(),
        name: 'SUPER_ADMIN',
        code: RoleType.SUPER_ADMIN,
        description: 'Full system access',
        createdBy: 'seed',
        updatedBy: 'seed',
      },
    ]);
    console.log('Roles seeded');
  }

  private async seedUsers() {
    const exists = await this.userRepo.exists();
    if (exists) return;

    const [adminRole, userRole, superAdminRole] = await Promise.all([
      this.roleRepo.findOneBy({ code: RoleType.ADMIN }),
      this.roleRepo.findOneBy({ code: RoleType.CUSTOMER }),
      this.roleRepo.findOneBy({ code: RoleType.SUPER_ADMIN }),
    ]);
    if (!adminRole || !userRole || !superAdminRole) throw new Error('Roles must be seeded first');

    const rounds = Number(this.config.get(ENV_KEYS.PASSWORD_SALT) ?? 10);

    await this.userRepo.insert([
      {
        id: uuid4(),
        name: 'Admin User',
        email: 'admin@billsystem.com',
        phone: '971500000001',
        passwordHash: await bcrypt.hash('admin@2025', rounds), // 👈 entity prop
        verified: true,
        roleId: adminRole.id,
        createdBy: 'seed',
        updatedBy: 'seed',
      } as UserEntity,
      {
        id: uuid4(),
        name: 'Regular User',
        email: 'user@billsystem.com',
        phone: '971500000002',
        passwordHash: await bcrypt.hash('user@2025', rounds),
        verified: true,
        roleId: userRole.id,
        createdBy: 'seed',
        updatedBy: 'seed',
      } as UserEntity,
      {
        id: uuid4(),
        name: 'Super Admin',
        email: 'super-admin@billsystem.com',
        phone: '971500000003',
        passwordHash: await bcrypt.hash('super-admin@2025', rounds),
        verified: true,
        roleId: superAdminRole.id,
        createdBy: 'seed',
        updatedBy: 'seed',
      } as UserEntity,
    ]);
    console.log('Users seeded');
  }

  private async seedPlans() {
    const exists = await this.planRepo.exists();
    if (exists) return;
    await this.planRepo.insert([
      {
        id: uuid4(),
        name: 'Basic Plan',
        price: 199.0,
        billingCycle: Cycle.MONTHLY,
        features: ['Feature 1'],
        trialDays: 7,
        status: PlanStatus.ACTIVE,
        createdBy: 'seed',
        updatedBy: 'seed',
      },
      {
        id: uuid4(),
        name: 'Pro Plan',
        price: 499.0,
        billingCycle: Cycle.YEARLY,
        features: ['Feature 1', 'Feature 2'],
        trialDays: 14,
        status: PlanStatus.ACTIVE,
        createdBy: 'seed',
        updatedBy: 'seed',
      },
    ]);
    console.log('Plans seeded');
  }

  private async seedSubscriptions() {
    const exists = await this.subscriptionRepo.exists();
    if (exists) return;

    const [user, plan] = await Promise.all([
      this.userRepo.findOneBy({ email: 'user@billsystem.com' }),
      this.planRepo.findOneBy({ name: 'Basic Plan' }),
    ]);

    if (!user || !plan) throw new Error('Users and Plans must be seeded first');

    const now = new Date();
    const endDate = new Date(now);
    endDate.setMonth(now.getMonth() + 1);

    await this.subscriptionRepo.insert([
      {
        userId: user.id,
        planId: plan.id,
        status: SubscriptionStatus.ACTIVE,
        autoRenew: true,
        startDate: now,
        endDate,
        createdBy: 'seed',
        updatedBy: 'seed',
      } as SubscriptionEntity,
    ]);
    console.log('Subscriptions seeded');
  }
}
