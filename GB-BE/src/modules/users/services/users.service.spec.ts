import {
  ConflictException,
  EntityNotFoundException,
} from '../../../common/exceptions';
import { UserRow } from '../domain/user.interface';
import { UserStatus } from '../domain/user.types';
import { UsersService } from './users.service';

describe('UsersService', () => {
  let usersRepository: {
    create: jest.Mock;
    findById: jest.Mock;
    findByIdUnscoped: jest.Mock;
    findActiveByEmailAcrossBusinesses: jest.Mock;
    findAll: jest.Mock;
    update: jest.Mock;
    updatePasswordHash: jest.Mock;
    updateLastLoginAt: jest.Mock;
    setStatus: jest.Mock;
    softDelete: jest.Mock;
    existsByEmailInBusiness: jest.Mock;
  };
  let rolesService: { findOne: jest.Mock };
  let branchesService: { findOne: jest.Mock };
  let auditService: { record: jest.Mock };
  let service: UsersService;

  const businessId = 'business-1';

  function makeUserRow(overrides: Partial<UserRow> = {}): UserRow {
    return {
      id: 'user-1',
      business_id: businessId,
      branch_id: null,
      role_id: 'role-1',
      first_name: 'Ada',
      last_name: 'Lovelace',
      email: 'ada@goldenbites.local',
      password_hash: '$2b$10$hash',
      phone: null,
      status: UserStatus.ACTIVE,
      last_login_at: null,
      created_at: new Date(),
      updated_at: new Date(),
      deleted_at: null,
      ...overrides,
    };
  }

  beforeEach(() => {
    usersRepository = {
      create: jest.fn(),
      findById: jest.fn(),
      findByIdUnscoped: jest.fn(),
      findActiveByEmailAcrossBusinesses: jest.fn(),
      findAll: jest.fn(),
      update: jest.fn(),
      updatePasswordHash: jest.fn(),
      updateLastLoginAt: jest.fn(),
      setStatus: jest.fn(),
      softDelete: jest.fn(),
      existsByEmailInBusiness: jest.fn(),
    };
    rolesService = { findOne: jest.fn() };
    branchesService = { findOne: jest.fn() };
    auditService = { record: jest.fn() };

    service = new UsersService(
      usersRepository,
      rolesService as never,
      branchesService as never,
      auditService as never,
    );
  });

  describe('create', () => {
    it('creates a user after validating the role and checking email uniqueness', async () => {
      rolesService.findOne.mockResolvedValue({ id: 'role-1' });
      usersRepository.existsByEmailInBusiness.mockResolvedValue(false);
      usersRepository.create.mockResolvedValue(makeUserRow());

      const user = await service.create(businessId, {
        firstName: 'Ada',
        lastName: 'Lovelace',
        email: 'ada@goldenbites.local',
        password: 'SuperSecret1',
        roleId: 'role-1',
      });

      expect(user.email).toBe('ada@goldenbites.local');
      expect(rolesService.findOne).toHaveBeenCalledWith(businessId, 'role-1');
      expect(usersRepository.create).toHaveBeenCalled();
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access -- jest.Mock calls are untyped
      const createArg = usersRepository.create.mock.calls[0][0] as {
        passwordHash: string;
      };
      expect(createArg.passwordHash).not.toBe('SuperSecret1');
      expect(auditService.record).toHaveBeenCalled();
    });

    it('validates the branch belongs to the business when provided', async () => {
      rolesService.findOne.mockResolvedValue({ id: 'role-1' });
      branchesService.findOne.mockResolvedValue({ id: 'branch-1' });
      usersRepository.existsByEmailInBusiness.mockResolvedValue(false);
      usersRepository.create.mockResolvedValue(
        makeUserRow({ branch_id: 'branch-1' }),
      );

      await service.create(businessId, {
        firstName: 'Ada',
        lastName: 'Lovelace',
        email: 'ada@goldenbites.local',
        password: 'SuperSecret1',
        roleId: 'role-1',
        branchId: 'branch-1',
      });

      expect(branchesService.findOne).toHaveBeenCalledWith(
        businessId,
        'branch-1',
      );
    });

    it('rejects a duplicate email within the same business', async () => {
      rolesService.findOne.mockResolvedValue({ id: 'role-1' });
      usersRepository.existsByEmailInBusiness.mockResolvedValue(true);

      await expect(
        service.create(businessId, {
          firstName: 'Ada',
          lastName: 'Lovelace',
          email: 'ada@goldenbites.local',
          password: 'SuperSecret1',
          roleId: 'role-1',
        }),
      ).rejects.toThrow(ConflictException);
      expect(usersRepository.create).not.toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('throws EntityNotFoundException when the user is not owned by the business', async () => {
      usersRepository.findById.mockResolvedValue(null);

      await expect(service.findOne(businessId, 'user-1')).rejects.toThrow(
        EntityNotFoundException,
      );
    });
  });

  describe('password helpers', () => {
    it('hashes a password so it never matches the plain value', async () => {
      const hash = await service.hashPassword('SuperSecret1');
      expect(hash).not.toBe('SuperSecret1');
      await expect(service.verifyPassword('SuperSecret1', hash)).resolves.toBe(
        true,
      );
      await expect(service.verifyPassword('WrongPassword', hash)).resolves.toBe(
        false,
      );
    });
  });

  describe('softDelete', () => {
    it('throws EntityNotFoundException when nothing was deleted', async () => {
      usersRepository.softDelete.mockResolvedValue(null);

      await expect(service.softDelete(businessId, 'user-1')).rejects.toThrow(
        EntityNotFoundException,
      );
    });

    it('records an audit entry on success', async () => {
      usersRepository.softDelete.mockResolvedValue(makeUserRow());

      await service.softDelete(businessId, 'user-1', 'actor-1');

      expect(auditService.record).toHaveBeenCalledWith(
        expect.objectContaining({ action: 'DELETE', entityId: 'user-1' }),
      );
    });
  });
});
