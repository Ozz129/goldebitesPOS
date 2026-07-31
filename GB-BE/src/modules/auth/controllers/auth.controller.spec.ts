import { AuthController } from './auth.controller';
import { AuthService } from '../services/auth.service';

describe('AuthController', () => {
  let service: jest.Mocked<
    Pick<
      AuthService,
      | 'login'
      | 'refresh'
      | 'logout'
      | 'changePassword'
      | 'forgotPassword'
      | 'resetPassword'
    >
  >;
  let controller: AuthController;

  beforeEach(() => {
    service = {
      login: jest.fn(),
      refresh: jest.fn(),
      logout: jest.fn(),
      changePassword: jest.fn(),
      forgotPassword: jest.fn(),
      resetPassword: jest.fn(),
    };
    controller = new AuthController(service as unknown as AuthService);
  });

  it('login() forwards credentials plus request metadata', async () => {
    service.login.mockResolvedValue({ accessToken: 'x' } as never);

    await controller.login(
      { email: 'a@b.com', password: 'x' },
      '127.0.0.1',
      'jest-agent',
    );

    expect(service.login).toHaveBeenCalledWith(
      { email: 'a@b.com', password: 'x' },
      { ipAddress: '127.0.0.1', userAgent: 'jest-agent' },
    );
  });

  it('refresh() forwards the raw refresh token and metadata', async () => {
    service.refresh.mockResolvedValue({ accessToken: 'x' } as never);

    await controller.refresh(
      { refreshToken: 'raw-token' },
      '127.0.0.1',
      undefined,
    );

    expect(service.refresh).toHaveBeenCalledWith('raw-token', {
      ipAddress: '127.0.0.1',
      userAgent: undefined,
    });
  });

  it('logout() revokes the given refresh token', async () => {
    await controller.logout({ refreshToken: 'raw-token' });

    expect(service.logout).toHaveBeenCalledWith('raw-token');
  });

  it('changePassword() scopes the change to the current user', async () => {
    const result = await controller.changePassword('user-1', 'business-1', {
      currentPassword: 'old',
      newPassword: 'new',
    });

    expect(service.changePassword).toHaveBeenCalledWith(
      'user-1',
      'business-1',
      {
        currentPassword: 'old',
        newPassword: 'new',
      },
    );
    expect(result).toEqual({ message: 'Password updated successfully' });
  });

  it('forgotPassword() always returns the same generic message', async () => {
    const result = await controller.forgotPassword({ email: 'a@b.com' });

    expect(service.forgotPassword).toHaveBeenCalledWith({ email: 'a@b.com' });
    expect(result.message).toMatch(/password reset instructions/);
  });

  it('resetPassword() delegates to the service', async () => {
    const result = await controller.resetPassword({
      token: 't',
      newPassword: 'new',
    });

    expect(service.resetPassword).toHaveBeenCalledWith({
      token: 't',
      newPassword: 'new',
    });
    expect(result).toEqual({ message: 'Password reset successfully' });
  });
});
