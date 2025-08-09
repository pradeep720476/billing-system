import { User } from 'src/shared/domain/user.domain';
import { UserRepository } from '../repositories/user.respository';
import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import * as bcrypt from 'bcryptjs';
import { RoleRepository } from 'src/modules/role/repositories/role.repository';
import { AssignRoleDto } from '../controllers/dto/assign-role.dto';
import { RegisterUserRequestDto } from 'src/modules/auth/dto/register-user-request.dto';
import { ConfigService } from '@nestjs/config';
import { ENV_KEYS } from 'src/shared/types/env-keys';
import { RoleType } from 'src/shared/enums/role-type.enum';

@Injectable()
export class UserService {
  constructor(
    @Inject(UserRepository) private readonly userRepo: UserRepository,
    @Inject(RoleRepository) private readonly roleRepo: RoleRepository,
    private readonly config: ConfigService,
  ) {}

  async findByEmailOrPhone(emailOrPhone: string): Promise<User> {
    const q = emailOrPhone.trim();
    const isEmail = q.includes('@');
    const user = isEmail
      ? await this.userRepo.findByEmail(q.toLowerCase())
      : await this.userRepo.findByPhone(q);
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async me(id: string): Promise<User> {
    const user = await this.userRepo.findById(id);
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async register(dto: RegisterUserRequestDto): Promise<User> {
    const email = dto.email.trim().toLowerCase();
    const phone = dto.phone.trim();

    const existing =
      (await this.userRepo.findByEmail(email)) || (await this.userRepo.findByPhone(phone));
    if (existing) throw new ConflictException('Email or phone number already exists');

    const role = await this.roleRepo.findRoleByCode(RoleType.CUSTOMER);
    if (!role) throw new NotFoundException('Role does not exist');

    const saltRounds = Number(this.config.get(ENV_KEYS.PASSWORD_SALT) ?? 10);
    const hashed = await bcrypt.hash(dto.password, saltRounds);

    const newUser = new User(uuidv4(), dto.name, email, phone, hashed, true, role.id);
    return this.userRepo.save(newUser);
  }

  async exists(id: string): Promise<boolean> {
    return this.userRepo.exists(id);
  }

  async listUsers() {
    return this.userRepo.findAll();
  }

  async assignRole(input: AssignRoleDto): Promise<void> {
    const exists = await this.exists(input.userId);
    if (!exists) throw new NotFoundException('Invalid user');

    const role = await this.roleRepo.findRoleByCode(input.role);
    if (!role) throw new NotFoundException('Given role does not exist');

    // Prefer updating by roleId to keep consistency with register()
    const updated = await this.userRepo.updateRole(input.userId, role.id);
    if (!updated) throw new BadRequestException(`Unable to update role for the given user`);
  }
}
