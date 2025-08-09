import { Column, Entity, OneToMany, Index, Unique } from 'typeorm';
import { UserEntity } from '../../../user/repositories/entities/user.entity';
import { BaseEntity } from '../../../../shared/entities/base.entity';
import { RoleType } from '../../../../shared/enums/role-type.enum';

@Entity('roles')
@Index('idx_roles_code', ['code'], { unique: true })
export class RoleEntity extends BaseEntity {
  @Column({ type: 'enum', enum: RoleType })
  code: RoleType;

  @Column({ length: 50, unique: true })
  name: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @OneToMany(() => UserEntity, (user) => user.role, { cascade: false })
  users: UserEntity[];
}
