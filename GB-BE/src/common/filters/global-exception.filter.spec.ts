import {
  ArgumentsHost,
  BadRequestException,
  HttpStatus,
  NotFoundException,
} from '@nestjs/common';
import { EntityNotFoundException } from '../exceptions';
import { GlobalExceptionFilter } from './global-exception.filter';

function createHost(url: string) {
  const json = jest.fn();
  const status = jest.fn().mockReturnValue({ json });
  const response = { status };
  const request = { method: 'GET', url };

  const host = {
    switchToHttp: () => ({
      getRequest: () => request,
      getResponse: () => response,
    }),
  } as unknown as ArgumentsHost;

  return { host, status, json };
}

describe('GlobalExceptionFilter', () => {
  let filter: GlobalExceptionFilter;

  beforeEach(() => {
    filter = new GlobalExceptionFilter();
  });

  it('formats a DomainException using its own status, code and details', () => {
    const { host, status, json } = createHost('/api/v1/products/123');

    filter.catch(new EntityNotFoundException('Product', '123'), host);

    expect(status).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
    expect(json).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: HttpStatus.NOT_FOUND,
        code: 'ENTITY_NOT_FOUND',
        path: '/api/v1/products/123',
      }),
    );
  });

  it('formats a built-in NestJS HttpException with a default code for its status', () => {
    const { host, status, json } = createHost('/api/v1/anything');

    filter.catch(new NotFoundException('Route not found'), host);

    expect(status).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
    expect(json).toHaveBeenCalledWith(
      expect.objectContaining({
        code: 'NOT_FOUND',
        message: 'Route not found',
      }),
    );
  });

  it('collects class-validator messages into details.validationErrors', () => {
    const { host, json } = createHost('/api/v1/products');

    filter.catch(
      new BadRequestException({
        message: ['name should not be empty'],
        error: 'Bad Request',
      }),
      host,
    );

    expect(json).toHaveBeenCalledWith(
      expect.objectContaining({
        code: 'BAD_REQUEST',
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- expect.objectContaining() is typed `any` in @types/jest
        details: expect.objectContaining({
          validationErrors: ['name should not be empty'],
        }),
      }),
    );
  });

  it('falls back to a generic 500 for unknown errors without leaking internal messages', () => {
    const { host, status, json } = createHost('/api/v1/whatever');

    filter.catch(new Error('secret internal detail'), host);

    expect(status).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
    expect(json).toHaveBeenCalledWith(
      expect.objectContaining({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'An unexpected error occurred',
      }),
    );
  });
});
