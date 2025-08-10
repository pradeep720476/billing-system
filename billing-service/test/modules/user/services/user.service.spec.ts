import 'reflect-metadata';
import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';

import { UserService } from 'src/modules/user/services/user.service';
import { UserRepository } from 'src/modules/user/repositories/user.respository';
import { RoleRepository } from 'src/modules/role/repositories/role.repository';
import { ConfigService } from '@nestjs/config';

import { RoleType } from 'src/shared/enums/role-type.enum';
import { ENV_KEYS } from 'src/shared/types/env-keys';

jest.mock('uuid', () => ({ v4: () => 'user-uuid-1' }));
jest.mock('bcryptjs', () => ({
  hash: jest.fn(async (pwd: string, rounds: number) => `hashed(${pwd})::${rounds}`),
}));

describe('UserService (unit)', () => {
  let service: UserService;

  const userRepoMock = {
    findByEmail: jest.fn(),
    findByPhone: jest.fn(),
    findById: jest.fn(),
    save: jest.fn(),
    exists: jest.fn(),
    findAll: jest.fn(),
    updateRole: jest.fn(),
  };

  const roleRepoMock = {
    findRoleByCode: jest.fn(),
  };

  const configMock = {
    get: jest.fn(),
  };

  beforeEach(async () => {
    jest.resetAllMocks();

    configMock.get.mockImplementation((k: string) => {
      if (k === ENV_KEYS.PASSWORD_SALT) return '10';
      return undefined;
    });

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        { provide: UserRepository, useValue: userRepoMock },
        { provide: RoleRepository, useValue: roleRepoMock },
        { provide: ConfigService, useValue: configMock },
      ],
    }).compile();

    service = module.get(UserService);
  });

  describe('findByEmailOrPhone', () => {
    it('looks up by email (lowercased) and returns user', async () => {
      userRepoMock.findByEmail.mockResolvedValue({ id: 'u1', email: 'a@x.com' });

      const user = await service.findByEmailOrPhone('A@X.COM');
      expect(userRepoMock.findByEmail).toHaveBeenCalledWith('a@x.com');
      expect(user).toEqual({ id: 'u1', email: 'a@x.com' });
    });

    it('looks up by phone and returns user', async () => {
      userRepoMock.findByPhone.mockResolvedValue({ id: 'u2', phone: '555' });

      const user = await service.findByEmailOrPhone('555');
      expect(userRepoMock.findByPhone).toHaveBeenCalledWith('555');
      expect(user).toEqual({ id: 'u2', phone: '555' });
    });

    it('throws NotFound if not found by email', async () => {
      userRepoMock.findByEmail.mockResolvedValue(null);
      await expect(service.findByEmailOrPhone('a@x.com')).rejects.toBeInstanceOf(NotFoundException);
    });
  });

  describe('me', () => {
    it('returns user', async () => {
      userRepoMock.findById.mockResolvedValue({ id: 'me1' });
      await expect(service.me('me1')).resolves.toEqual({ id: 'me1' });
    });
  });

  describe('register', () => {
    it('throws Conflict when email or phone exists', async () => {
      userRepoMock.findByEmail.mockResolvedValue({ id: 'existing' });
      userRepoMock.findByPhone.mockResolvedValue(null);

      await expect(
        service.register({ name: 'A', email: 'a@x.com', phone: '111', password: 'pw' } as any),
      ).rejects.toBeInstanceOf(ConflictException);
    });

    it('hashes password with salt from config and saves new user', async () => {
      userRepoMock.findByEmail.mockResolvedValue(null);
      userRepoMock.findByPhone.mockResolvedValue(null);
      roleRepoMock.findRoleByCode.mockResolvedValue({ id: 'role-customer' });
      userRepoMock.save.mockImplementation(async (u) => u);

      // override salt from config for assertion
      configMock.get.mockImplementation((k: string) => {
        if (k === ENV_KEYS.PASSWORD_SALT) return '12';
        return undefined;
      });

      const dto = {
        name: 'Bob',
        email: 'Bob@Example.com',
        phone: ' 777 ',
        password: 's3cr3t',
      } as any;
      const created = await service.register(dto);

      // Email lowercased, phone trimmed
      expect(userRepoMock.findByEmail).toHaveBeenCalledWith('bob@example.com');
      expect(userRepoMock.findByPhone).toHaveBeenCalledWith('777');

      // Saved user fields
      expect(created.id).toBe('user-uuid-1');
      expect(created.name).toBe('Bob');
      expect(created.email).toBe('bob@example.com');
      expect(created.phone).toBe('777');
      expect(created.roleId).toBe('role-customer');
      expect(created.verified).toBe(true);
    });
  });


  describe('assignRole', () => {
    it('throws NotFound if user does not exist', async () => {
      userRepoMock.exists.mockResolvedValue(false);
      await expect(
        service.assignRole({ userId: 'u1', role: RoleType.ADMIN } as any),
      ).rejects.toBeInstanceOf(NotFoundException);
    });

    it('updates role successfully', async () => {
      userRepoMock.exists.mockResolvedValue(true);
      roleRepoMock.findRoleByCode.mockResolvedValue({ id: 'role-admin' });
      userRepoMock.updateRole.mockResolvedValue(true);

      await expect(
        service.assignRole({ userId: 'u1', role: RoleType.ADMIN } as any),
      ).resolves.toBeUndefined();
      expect(userRepoMock.updateRole).toHaveBeenCalledWith('u1', 'role-admin');
    });
  });
});
