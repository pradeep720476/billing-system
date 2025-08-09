import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLE_KEY } from '../decorators/role.decorators';
import { RoleType } from '../enums/role-type.enum';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { Role } from 'src/modules/role/domains/role.domain';

@Injectable()
export class RoleGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    const requiredRoles = this.reflector.getAllAndOverride<RoleType[]>(ROLE_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles || requiredRoles.length === 0) return true;

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new UnauthorizedException('Authentication required');
    }

    const roles: Role[] = Array.isArray(user.roles) ? user.roles : [user.roles];
    const isAllowed = requiredRoles.some((role) => roles?.map(r => r.name).includes(role));

    if (!isAllowed) {
      throw new ForbiddenException(`Don't have permission to perform this action`);
    }

    return true;
  }
}
