import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UnauthorizedOperationException } from '../exceptions';
import { AuthenticatedUser } from '../interfaces/authenticated-user.interface';
import { REQUIRES_PLATFORM_ADMIN_KEY } from '../decorators/require-platform-admin.decorator';

interface RequestWithUser {
  user?: AuthenticatedUser;
}

@Injectable()
export class PlatformAdminGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiresPlatformAdmin = this.reflector.getAllAndOverride<boolean>(
      REQUIRES_PLATFORM_ADMIN_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiresPlatformAdmin) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest<RequestWithUser>();

    if (!user?.isPlatformAdmin) {
      throw new UnauthorizedOperationException(
        'This action requires a platform administrator account',
      );
    }

    return true;
  }
}
