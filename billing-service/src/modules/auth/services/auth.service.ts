import { LoginUserRequestDto } from '../dto/login-user-request.dto';
import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { JwtProvider } from '../providers/jwt.provider';
import { RegisterUserRequestDto } from '../dto/register-user-request.dto';
import { User } from 'src/shared/domain/user.domain';
import { UserService } from 'src/modules/user/services/user.service';
import { RoleRepository } from 'src/modules/role/repositories/role.repository';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly roleRepo: RoleRepository,
    private readonly jwt: JwtProvider,
  ) {}

  async login(dto: LoginUserRequestDto) {
    try {
      const user = await this.userService.findByEmailOrPhone(dto.username);
      if (!user) throw new NotFoundException('User not found');
      const role = await this.roleRepo.findRoleById(user.roleId ?? null);
      if (!role) throw new NotFoundException('Role not found');
      const isPasswordValid = await bcrypt.compare(dto.password, user?.passwordHash ?? '');
      if (!isPasswordValid) throw new UnauthorizedException('Invalid credentials');
      return {
        token: this.jwt.token(user, role),
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new UnauthorizedException('Invalid credentials');
      }
      throw error;
    }
  }

  async register(dto: RegisterUserRequestDto): Promise<User> {
    return await this.userService.register(dto);
  }
}
