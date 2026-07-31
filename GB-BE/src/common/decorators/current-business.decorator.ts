import { ExecutionContext, createParamDecorator } from '@nestjs/common';
import { AuthenticatedUser } from '../interfaces/authenticated-user.interface';

interface RequestWithUser {
  user?: AuthenticatedUser;
}

/**
 * Injects the current user's businessId. Always derive tenant scoping from
 * this — never trust a business_id sent in the request body/query.
 */
export const CurrentBusiness = createParamDecorator(
  (_: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<RequestWithUser>();
    return request.user?.businessId;
  },
);
