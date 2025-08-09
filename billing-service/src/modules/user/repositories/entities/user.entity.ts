import { Column, Entity, Index, JoinColumn, ManyToOne, RelationId } from 'typeorm';
import { BaseEntity } from '../../../../shared/entities/base.entity';
import { RoleEntity } from '../../../role/repositories/entities/role.entity';

@Entity('users')
export class UserEntity extends BaseEntity {
  @Column({ length: 100 })
  name!: string;

  @Column({ unique: true, length: 150 })
  email!: string;

  @Column({ unique: true, length: 20 })
  phone!: string;

  @Column({ name: 'password_hash', length: 255, select: false })
  passwordHash!: string;

  @Column({ default: false })
  verified!: boolean;

  @ManyToOne(() => RoleEntity, (role) => role.users, { eager: true, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'role_id' })
  role!: RoleEntity;

  @Column({ name: 'role_id', type: 'uuid' })
  roleId: string;
}
