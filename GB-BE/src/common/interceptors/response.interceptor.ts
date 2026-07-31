import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { RESPONSE_RAW_KEY } from '../decorators/raw-response.decorator';
import { Reflector } from '@nestjs/core';

export interface StandardResponse<T> {
  success: true;
  data: T;
  meta: Record<string, unknown> | undefined;
  timestamp: string;
}

/**
 * Wraps every controller return value in a standard envelope. Handlers
 * decorated with @RawResponse() (file downloads, streams) are passed
 * through untouched.
 */
@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<
  T,
  StandardResponse<T> | T
> {
  constructor(private readonly reflector: Reflector) {}

  intercept(
    context: ExecutionContext,
    next: CallHandler<T>,
  ): Observable<StandardResponse<T> | T> {
    const isRaw = this.reflector.getAllAndOverride<boolean>(RESPONSE_RAW_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isRaw) {
      return next.handle();
    }

    return next.handle().pipe(
      map((result) => {
        const isPaginated =
          result &&
          typeof result === 'object' &&
          'data' in result &&
          'meta' in result;

        if (isPaginated) {
          const { data, meta } = result as unknown as {
            data: T;
            meta: Record<string, unknown>;
          };
          return {
            success: true as const,
            data,
            meta,
            timestamp: new Date().toISOString(),
          };
        }

        return {
          success: true as const,
          data: result,
          meta: undefined,
          timestamp: new Date().toISOString(),
        };
      }),
    );
  }
}
