import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { DomainException } from '../exceptions';
import { ErrorResponseBody } from '../interfaces/error-response.interface';
import { isPgDatabaseError, mapPgError } from '../utils/pg-error-mapper';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const { status, code, message, details } = this.resolve(exception);

    const body: ErrorResponseBody = {
      statusCode: status,
      error: HttpStatus[status] ?? 'Internal Server Error',
      message,
      code,
      details,
      timestamp: new Date().toISOString(),
      path: request.url,
    };

    if (status >= HttpStatus.INTERNAL_SERVER_ERROR) {
      this.logger.error(
        `${request.method} ${request.url} -> ${status} [${code}] ${message}`,
        exception instanceof Error ? exception.stack : undefined,
      );
    } else {
      this.logger.warn(
        `${request.method} ${request.url} -> ${status} [${code}] ${message}`,
      );
    }

    response.status(status).json(body);
  }

  private resolve(exception: unknown): {
    status: HttpStatus;
    code: string;
    message: string;
    details: Record<string, unknown>;
  } {
    if (exception instanceof DomainException) {
      return {
        status: exception.getStatus(),
        code: exception.code,
        message: exception.message,
        details: exception.details ?? {},
      };
    }

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const response = exception.getResponse();
      const message = this.extractHttpExceptionMessage(
        response,
        exception.message,
      );
      return {
        status,
        code: this.defaultCodeForStatus(status),
        message,
        details: this.extractHttpExceptionDetails(response),
      };
    }

    if (isPgDatabaseError(exception)) {
      const mapped = mapPgError(exception);
      return mapped;
    }

    return {
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      code: 'INTERNAL_SERVER_ERROR',
      message: 'An unexpected error occurred',
      details: {},
    };
  }

  private extractHttpExceptionMessage(
    response: unknown,
    fallback: string,
  ): string {
    if (typeof response === 'string') {
      return response;
    }
    if (response && typeof response === 'object' && 'message' in response) {
      const value = (response as Record<string, unknown>).message;
      if (Array.isArray(value)) {
        return value.join('; ');
      }
      if (typeof value === 'string') {
        return value;
      }
    }
    return fallback;
  }

  private extractHttpExceptionDetails(
    response: unknown,
  ): Record<string, unknown> {
    if (!response || typeof response !== 'object') {
      return {};
    }

    const body = response as Record<string, unknown>;
    const details: Record<string, unknown> = {};

    for (const key of Object.keys(body)) {
      if (key === 'message' || key === 'statusCode' || key === 'error') {
        continue;
      }
      details[key] = body[key];
    }

    if (Array.isArray(body.message)) {
      details.validationErrors = body.message;
    }

    return details;
  }

  private defaultCodeForStatus(status: HttpStatus): string {
    switch (status) {
      case HttpStatus.BAD_REQUEST:
        return 'BAD_REQUEST';
      case HttpStatus.UNAUTHORIZED:
        return 'UNAUTHORIZED';
      case HttpStatus.FORBIDDEN:
        return 'FORBIDDEN';
      case HttpStatus.NOT_FOUND:
        return 'NOT_FOUND';
      case HttpStatus.CONFLICT:
        return 'CONFLICT';
      case HttpStatus.UNPROCESSABLE_ENTITY:
        return 'UNPROCESSABLE_ENTITY';
      case HttpStatus.TOO_MANY_REQUESTS:
        return 'TOO_MANY_REQUESTS';
      case HttpStatus.SERVICE_UNAVAILABLE:
        return 'SERVICE_UNAVAILABLE';
      default:
        return 'ERROR';
    }
  }
}
