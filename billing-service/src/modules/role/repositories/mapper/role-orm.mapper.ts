import { Role } from '../../domains/role.domain';
import { RoleEntity } from '../entities/role.entity';

export class RoleOrmMapper {
  static toDomain(entity: RoleEntity): Role {
    return new Role(entity.id, entity.name, entity.description ?? null, entity.code);
  }

  static fromDomain(domain: Role): RoleEntity {
    const entity = new RoleEntity();
    entity.id = domain.id;
    entity.name = domain.name;
    entity.description = domain.description ?? undefined;
    entity.code = domain.code;
    return entity;
  }
}
