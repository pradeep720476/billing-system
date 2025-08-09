import { Repository } from 'typeorm';
import { UserRepository } from './user.respository';
import { InjectRepository } from '@nestjs/typeorm';
import { Injectable } from '@nestjs/common';
import { User } from 'src/shared/domain/user.domain';
import { UserEntity } from 'src/modules/user/repositories/entities/user.entity';
import { UserOrmMapper } from './mapper/user-orm.mapper';

@Injectable()
export class UserRepositoryImpl implements UserRepository {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepo: Repository<UserEntity>,
  ) {}

  async findById(id: string): Promise<User | null> {
    const user = await this.userRepo.findOne({
      where: { id },
    });
    return user ? UserOrmMapper.toDomain(user) : null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const user = await this.userRepo.findOne({
      where: { email },
      select: ['id', 'email', 'passwordHash', 'phone', 'roleId', 'name'],
    });
    return user ? UserOrmMapper.toDomain(user) : null;
  }

  async findByPhone(phone: string): Promise<User | null> {
    const user = await this.userRepo.findOne({
      where: { phone },
      select: ['id', 'email', 'passwordHash', 'phone', 'roleId', 'name'],
    });
    return user ? UserOrmMapper.toDomain(user) : null;
  }

  async save(user: User): Promise<User> {
    const entity = UserOrmMapper.fromDomain(user);
    const saved = await this.userRepo.save(entity);
    return UserOrmMapper.toDomain(saved);
  }

  async findAll(): Promise<User[]> {
    const users = await this.userRepo.find();
    return users.length ? users.map((u) => UserOrmMapper.toDomain(u)) : [];
  }

  async updateRole(userId: string, roleId: string): Promise<boolean> {
    const result = await this.userRepo.update({ id: userId }, { roleId });
    return result.affected === 1;
  }

  async exists(id: string): Promise<boolean> {
    return this.userRepo.exists({ where: { id } });
  }
}
