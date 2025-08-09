import { Role } from 'src/modules/role/domains/role.domain';
import { RoleRepository } from './role.repository';
import { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { RoleEntity } from 'src/modules/role/repositories/entities/role.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { RoleType } from 'src/shared/enums/role-type.enum';
import { RoleOrmMapper } from './mapper/role-orm.mapper';

@Injectable()
export class RoleRepositoryImpl implements RoleRepository {
  constructor(
    @InjectRepository(RoleEntity)
    private readonly roleRepo: Repository<RoleEntity>,
  ) {}

  async findRoleById(id: string): Promise<Role | null> {
    const role = await this.roleRepo.findOne({ where: { id } });
    return role ? RoleOrmMapper.toDomain(role) : null;
  }

  async findRoleByName(name: string): Promise<Role | null> {
    const role = await this.roleRepo.findOne({ where: { name } });
    return role ? RoleOrmMapper.toDomain(role) : null;
  }

  async findRoleByCode(code: RoleType): Promise<Role | null> {
    const role = await this.roleRepo.findOne({ where: { code } });
    return role ? RoleOrmMapper.toDomain(role) : null;
  }
}
