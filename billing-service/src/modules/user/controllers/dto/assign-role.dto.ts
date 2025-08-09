import { IsEnum, IsUUID } from 'class-validator';
import { RoleType } from 'src/shared/enums/role-type.enum';

export class AssignRoleDto {
  @IsUUID()
  userId: string;

  @IsEnum([RoleType.ADMIN, RoleType.CUSTOMER])
  role: RoleType;
}
