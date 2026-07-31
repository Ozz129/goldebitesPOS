import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UnauthorizedOperationException } from '../exceptions';
import { AuthenticatedUser } from '../interfaces/authenticated-user.interface';
import { PERMISSIONS_KEY } from '../decorators/permissions.decorator';

interface RequestWithUser {
  user?: AuthenticatedUser;
}

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest<RequestWithUser>();
    const granted = new Set(user?.permissions ?? []);
    const missing = requiredPermissions.filter(
      (permission) => !granted.has(permission),
    );

    if (missing.length > 0) {
      throw new UnauthorizedOperationException(
        `This action requires the following permission(s): ${missing.join(', ')}`,
      );
    }

    return true;
  }
}
