import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UnauthorizedOperationException } from '../exceptions';
import { AuthenticatedUser } from '../interfaces/authenticated-user.interface';
import { REQUIRES_FEATURE_KEY } from '../decorators/requires-feature.decorator';

interface RequestWithUser {
  user?: AuthenticatedUser;
}

@Injectable()
export class FeaturesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredFeature = this.reflector.getAllAndOverride<string>(
      REQUIRES_FEATURE_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredFeature) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest<RequestWithUser>();

    // A token issued before this guard existed has no enabledFeatures claim
    // at all — treat that the same as "not enabled" rather than throwing,
    // until the holder's next login/refresh mints a token with the field.
    if (!user || !user.enabledFeatures?.includes(requiredFeature)) {
      throw new UnauthorizedOperationException(
        `This business does not have the "${requiredFeature}" module enabled`,
      );
    }

    return true;
  }
}
