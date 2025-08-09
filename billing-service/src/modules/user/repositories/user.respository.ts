import { User } from 'src/shared/domain/user.domain';

export abstract class UserRepository {
  abstract findAll(): Promise<User[]>;
  abstract findById(id: string): Promise<User | null>;
  abstract findByEmail(email: string): Promise<User | null>;
  abstract findByPhone(phone: string): Promise<User | null>;
  abstract save(user: User): Promise<User>;
  abstract exists(id: string): Promise<boolean>;
  abstract updateRole(userId: string, roleId: string): Promise<boolean>;
}
