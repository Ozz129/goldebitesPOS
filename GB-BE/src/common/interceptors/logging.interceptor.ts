import {
  CallHandler,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { Response } from 'express';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { RequestWithId } from '../middleware/request-id.middleware';

/**
 * Logs one line per request with correlation data. Never logs request
 * bodies, headers, or query strings, since those may carry credentials,
 * tokens, or customer PII.
 */
@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const httpContext = context.switchToHttp();
    const request = httpContext.getRequest<RequestWithId>();
    const response = httpContext.getResponse<Response>();
    const start = Date.now();

    const { method, url, requestId } = request;
    const userId = request.user
      ? (request.user as { userId?: string }).userId
      : undefined;
    const businessId = request.user
      ? (request.user as { businessId?: string }).businessId
      : undefined;

    return next.handle().pipe(
      tap({
        next: () =>
          this.log(
            requestId,
            method,
            url,
            response.statusCode,
            start,
            userId,
            businessId,
          ),
        error: (error: Error) =>
          this.log(
            requestId,
            method,
            url,
            // The exception filter hasn't run yet at this point in the
            // pipeline, so response.statusCode is still whatever Express
            // defaulted to (200) — resolve the real status from the error.
            error instanceof HttpException
              ? error.getStatus()
              : HttpStatus.INTERNAL_SERVER_ERROR,
            start,
            userId,
            businessId,
            error,
          ),
      }),
    );
  }

  private log(
    requestId: string,
    method: string,
    url: string,
    statusCode: number,
    start: number,
    userId?: string,
    businessId?: string,
    error?: Error,
  ): void {
    const durationMs = Date.now() - start;
    const context = [
      `requestId=${requestId}`,
      `user=${userId ?? '-'}`,
      `business=${businessId ?? '-'}`,
      `duration=${durationMs}ms`,
    ].join(' ');

    const message = `${method} ${url} ${statusCode} - ${context}`;

    const SERVER_ERROR_THRESHOLD = 500;
    if (error && statusCode >= SERVER_ERROR_THRESHOLD) {
      this.logger.error(`${message} error=${error.message}`);
    } else if (error) {
      this.logger.warn(`${message} error=${error.message}`);
    } else {
      this.logger.log(message);
    }
  }
}
