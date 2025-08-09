import { Role } from 'src/modules/role/domains/role.domain';
import { RoleType } from 'src/shared/enums/role-type.enum';

export abstract class RoleRepository {
  abstract findRoleByName(name: string): Promise<Role | null>;
  abstract findRoleByCode(code: RoleType): Promise<Role | null>;
  abstract findRoleById(id: string | null): Promise<Role | null>;
}
