import { SetMetadata } from '@nestjs/common';
import { RoleType } from '../enums/role-type.enum';

export const ROLE_KEY = 'roles';
export const Roles = (...roles: RoleType[]) => SetMetadata(ROLE_KEY, roles);
