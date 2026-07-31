import { CallHandler, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { of } from 'rxjs';
import { ResponseInterceptor } from './response.interceptor';

function createContext(): ExecutionContext {
  return {
    getHandler: () => ({}),
    getClass: () => ({}),
  } as unknown as ExecutionContext;
}

function createHandler(value: unknown): CallHandler {
  return { handle: () => of(value) };
}

describe('ResponseInterceptor', () => {
  it('wraps a plain result in the standard success envelope', (done) => {
    const reflector = {
      getAllAndOverride: jest.fn().mockReturnValue(false),
    } as unknown as Reflector;
    const interceptor = new ResponseInterceptor(reflector);

    interceptor
      .intercept(createContext(), createHandler({ id: 1 }))
      .subscribe((result) => {
        expect(result).toEqual(
          expect.objectContaining({
            success: true,
            data: { id: 1 },
            meta: undefined,
          }),
        );
        expect((result as { timestamp: string }).timestamp).toEqual(
          expect.any(String),
        );
        done();
      });
  });

  it('promotes data/meta from a paginated result into the envelope', (done) => {
    const reflector = {
      getAllAndOverride: jest.fn().mockReturnValue(false),
    } as unknown as Reflector;
    const interceptor = new ResponseInterceptor(reflector);
    const paginated = { data: [{ id: 1 }], meta: { page: 1, total: 1 } };

    interceptor
      .intercept(createContext(), createHandler(paginated))
      .subscribe((result) => {
        expect(result).toEqual(
          expect.objectContaining({
            success: true,
            data: [{ id: 1 }],
            meta: { page: 1, total: 1 },
          }),
        );
        done();
      });
  });

  it('passes the result through untouched when @RawResponse() is set', (done) => {
    const reflector = {
      getAllAndOverride: jest.fn().mockReturnValue(true),
    } as unknown as Reflector;
    const interceptor = new ResponseInterceptor(reflector);

    interceptor
      .intercept(createContext(), createHandler({ status: 'ok' }))
      .subscribe((result) => {
        expect(result).toEqual({ status: 'ok' });
        done();
      });
  });
});
