import { RoleType } from '../../../shared/enums/role-type.enum';

export class Role {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly description: string | null,
    public readonly code: RoleType,
  ) {}
}
