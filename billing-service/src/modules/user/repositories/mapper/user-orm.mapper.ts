// repositories/mapper/user-orm.mapper.ts
import { User } from 'src/shared/domain/user.domain';
import { UserEntity } from '../entities/user.entity';

export class UserOrmMapper {
  static toDomain(entity: UserEntity): User {
    return new User(
      entity.id,
      entity.name,
      entity.email,
      entity.phone,
      entity.passwordHash,
      entity.verified,
      entity.roleId ?? undefined,
    );
  }

  static fromDomain(domain: User): UserEntity {
    const entity = new UserEntity();
    entity.id = domain.id;
    entity.name = domain.name;
    entity.email = domain.email;
    entity.phone = domain.phone;
    entity.passwordHash = domain.passwordHash;
    entity.verified = domain.verified;
    entity.roleId = domain.roleId;
    return entity;
  }
}
