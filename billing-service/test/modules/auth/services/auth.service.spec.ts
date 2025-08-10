import 'reflect-metadata';
import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException, NotFoundException } from '@nestjs/common';
import { AuthService } from 'src/modules/auth/services/auth.service';
import { UserService } from 'src/modules/user/services/user.service';
import { RoleRepository } from 'src/modules/role/repositories/role.repository';
import { JwtProvider } from 'src/modules/auth/providers/jwt.provider';

jest.mock('bcryptjs', () => ({
  compare: jest.fn(),
}));
import * as bcrypt from 'bcryptjs';

describe('AuthService (unit)', () => {
  let service: AuthService;

  const userServiceMock = {
    findByEmailOrPhone: jest.fn(),
    register: jest.fn(),
  };

  const roleRepoMock = {
    findRoleById: jest.fn(),
  };

  const jwtMock = {
    token: jest.fn(),
  };

  beforeEach(async () => {
    jest.resetAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UserService, useValue: userServiceMock },
        { provide: RoleRepository, useValue: roleRepoMock },
        { provide: JwtProvider, useValue: jwtMock },
      ],
    }).compile();

    service = module.get(AuthService);
  });

  describe('login', () => {
    const dto = (username = 'alice@example.com', password = 'pw') => ({ username, password });

    it('returns token on success', async () => {
      const user = { id: 'u1', passwordHash: 'hashed', roleId: 'r1' };
      const role = { id: 'r1', code: 'ADMIN' };

      userServiceMock.findByEmailOrPhone.mockResolvedValue(user);
      roleRepoMock.findRoleById.mockResolvedValue(role);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      jwtMock.token.mockReturnValue('jwt-abc');

      const res = await service.login(dto());

      expect(userServiceMock.findByEmailOrPhone).toHaveBeenCalledWith('alice@example.com');
      expect(roleRepoMock.findRoleById).toHaveBeenCalledWith('r1');
      expect(bcrypt.compare).toHaveBeenCalledWith('pw', 'hashed');
      expect(jwtMock.token).toHaveBeenCalledWith(user, role);
      expect(res).toEqual({ token: 'jwt-abc' });
    });

    it('throws Unauthorized when password is invalid', async () => {
      const user = { id: 'u1', passwordHash: 'hashed', roleId: 'r1' };
      userServiceMock.findByEmailOrPhone.mockResolvedValue(user);
      roleRepoMock.findRoleById.mockResolvedValue({ id: 'r1' });
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(service.login(dto())).rejects.toBeInstanceOf(UnauthorizedException);
    });

    it('converts NotFound (user missing) to Unauthorized', async () => {
      userServiceMock.findByEmailOrPhone.mockRejectedValue(new NotFoundException('User not found'));

      await expect(service.login(dto())).rejects.toBeInstanceOf(UnauthorizedException);
    });
  });

  describe('register', () => {
    it('delegates to UserService.register and returns created user', async () => {
      const newUser = { id: 'u2', email: 'test@example.com' };
      userServiceMock.register.mockResolvedValue(newUser);

      const res = await service.register({
        name: 'Test',
        email: 'test@example.com',
        phone: '555',
        password: 'pw',
      } as any);

      expect(userServiceMock.register).toHaveBeenCalledWith({
        name: 'Test',
        email: 'test@example.com',
        phone: '555',
        password: 'pw',
      });
      expect(res).toBe(newUser);
    });
  });
});
