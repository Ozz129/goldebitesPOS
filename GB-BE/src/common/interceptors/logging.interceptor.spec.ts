import { CallHandler, ExecutionContext } from '@nestjs/common';
import { of, throwError } from 'rxjs';
import { LoggingInterceptor } from './logging.interceptor';

function createContext(request: object, response: object): ExecutionContext {
  return {
    switchToHttp: () => ({
      getRequest: () => request,
      getResponse: () => response,
    }),
  } as unknown as ExecutionContext;
}

describe('LoggingInterceptor', () => {
  let interceptor: LoggingInterceptor;

  beforeEach(() => {
    interceptor = new LoggingInterceptor();
  });

  it('logs a successful request without throwing', (done) => {
    const request = {
      method: 'GET',
      url: '/api/v1/health',
      requestId: 'req-1',
    };
    const response = { statusCode: 200 };
    const handler: CallHandler = { handle: () => of({ ok: true }) };

    interceptor.intercept(createContext(request, response), handler).subscribe({
      next: (value) => {
        expect(value).toEqual({ ok: true });
        done();
      },
    });
  });

  it('logs and rethrows when the downstream handler errors', (done) => {
    const request = { method: 'GET', url: '/api/v1/boom', requestId: 'req-2' };
    const response = { statusCode: 500 };
    const failure = new Error('boom');
    const handler: CallHandler = { handle: () => throwError(() => failure) };

    interceptor.intercept(createContext(request, response), handler).subscribe({
      error: (err) => {
        expect(err).toBe(failure);
        done();
      },
    });
  });

  it('reads userId and businessId off request.user when present', (done) => {
    const request = {
      method: 'GET',
      url: '/api/v1/orders',
      requestId: 'req-3',
      user: { userId: 'u1', businessId: 'b1' },
    };
    const response = { statusCode: 200 };
    const handler: CallHandler = { handle: () => of([]) };

    interceptor.intercept(createContext(request, response), handler).subscribe({
      next: () => {
        done();
      },
    });
  });
});
