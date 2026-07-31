import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtAuthGuard } from './jwt-auth.guard';

function createContext(): ExecutionContext {
  return {
    getHandler: () => ({}),
    getClass: () => ({}),
  } as unknown as ExecutionContext;
}

describe('JwtAuthGuard', () => {
  it('canActivate() short-circuits to true for @Public() routes', () => {
    const reflector = {
      getAllAndOverride: jest.fn().mockReturnValue(true),
    } as unknown as Reflector;
    const guard = new JwtAuthGuard(reflector);

    expect(guard.canActivate(createContext())).toBe(true);
  });

  describe('handleRequest', () => {
    let guard: JwtAuthGuard;

    beforeEach(() => {
      const reflector = {
        getAllAndOverride: jest.fn(),
      } as unknown as Reflector;
      guard = new JwtAuthGuard(reflector);
    });

    it('returns the user on success', () => {
      const user = { userId: 'u1' };
      expect(guard.handleRequest(null, user)).toBe(user);
    });

    it('throws UnauthorizedException when there is no user', () => {
      expect(() => guard.handleRequest(null, false)).toThrow(
        UnauthorizedException,
      );
    });

    it('throws UnauthorizedException (not the raw passport error) when passport errors', () => {
      expect(() =>
        guard.handleRequest(new Error('jwt expired'), false),
      ).toThrow(UnauthorizedException);
    });
  });
});
