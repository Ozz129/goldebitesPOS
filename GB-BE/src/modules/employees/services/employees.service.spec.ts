import { BusinessRuleException } from '../../../common/exceptions';
import { DEFAULT_EMPLOYEE_PASSWORD } from '../../../common/constants/default-password.constant';
import { UserStatus } from '../../users/domain/user.types';
import { EmployeeRow } from '../domain/employee.interface';
import { EmployeesService } from './employees.service';

describe('EmployeesService', () => {
  let employeesRepository: {
    create: jest.Mock;
    findById: jest.Mock;
    findAll: jest.Mock;
    update: jest.Mock;
    setStatus: jest.Mock;
    softDelete: jest.Mock;
    setUserId: jest.Mock;
    findShifts: jest.Mock;
    replaceShifts: jest.Mock;
  };
  let usersService: {
    create: jest.Mock;
    generateUniqueLoginEmail: jest.Mock;
    setPasswordHash: jest.Mock;
    setStatus: jest.Mock;
    findRawById: jest.Mock;
  };
  let transactionService: { execute: jest.Mock };
  let auditService: { record: jest.Mock };
  let service: EmployeesService;

  const businessId = 'business-1';
  const branchId = 'branch-1';
  const actorUserId = 'actor-1';

  function makeEmployeeRow(overrides: Partial<EmployeeRow> = {}): EmployeeRow {
    return {
      id: 'employee-1',
      business_id: businessId,
      branch_id: branchId,
      role_id: 'role-1',
      user_id: null,
      first_name: 'Juan',
      last_name: 'Perez',
      phone: null,
      email: null,
      position: null,
      status: 'ACTIVE' as EmployeeRow['status'],
      hire_date: null,
      notes: null,
      pay_rate: null,
      pay_frequency: null,
      created_at: new Date(),
      updated_at: new Date(),
      deleted_at: null,
      ...overrides,
    };
  }

  function makeCreatedUser(overrides: Partial<{ id: string; email: string; status: UserStatus }> = {}) {
    return {
      id: 'user-1',
      businessId,
      branchId,
      roleId: 'role-1',
      firstName: 'Juan',
      lastName: 'Perez',
      email: 'jupe1@personal.local',
      phone: null,
      status: UserStatus.ACTIVE,
      lastLoginAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      ...overrides,
    };
  }

  beforeEach(() => {
    employeesRepository = {
      create: jest.fn(),
      findById: jest.fn(),
      findAll: jest.fn(),
      update: jest.fn(),
      setStatus: jest.fn(),
      softDelete: jest.fn(),
      setUserId: jest.fn(),
      findShifts: jest.fn().mockResolvedValue([]),
      replaceShifts: jest.fn(),
    };
    usersService = {
      create: jest.fn(),
      generateUniqueLoginEmail: jest.fn(),
      setPasswordHash: jest.fn(),
      setStatus: jest.fn(),
      findRawById: jest.fn(),
    };
    transactionService = {
      execute: jest.fn((fn: (client: unknown) => unknown) => fn(undefined)),
    };
    auditService = { record: jest.fn() };
    service = new EmployeesService(
      employeesRepository as never,
      usersService as never,
      transactionService as never,
      auditService as never,
    );
  });

  describe('create', () => {
    it('auto-provisions a login account with a generated handle and the fixed default password', async () => {
      usersService.generateUniqueLoginEmail.mockResolvedValue('jupe1@personal.local');
      employeesRepository.create.mockResolvedValue(makeEmployeeRow());
      const createdUser = makeCreatedUser();
      usersService.create.mockResolvedValue(createdUser);
      employeesRepository.setUserId.mockResolvedValue(
        makeEmployeeRow({ user_id: createdUser.id }),
      );

      const result = await service.create(
        {
          businessId,
          branchId,
          roleId: 'role-1',
          firstName: 'Juan',
          lastName: 'Perez',
        },
        actorUserId,
      );

      expect(usersService.generateUniqueLoginEmail).toHaveBeenCalledWith(
        businessId,
        'Juan',
        'Perez',
      );
      expect(usersService.create).toHaveBeenCalledWith(
        businessId,
        expect.objectContaining({
          email: 'jupe1@personal.local',
          password: DEFAULT_EMPLOYEE_PASSWORD,
          roleId: 'role-1',
          mustChangePassword: true,
        }),
        actorUserId,
        undefined,
      );
      expect(employeesRepository.setUserId).toHaveBeenCalledWith(
        'employee-1',
        businessId,
        createdUser.id,
        undefined,
      );
      expect(result.userAccount).toEqual({
        id: createdUser.id,
        email: 'jupe1@personal.local',
        status: UserStatus.ACTIVE,
      });
      expect(transactionService.execute).toHaveBeenCalled();
    });

    it('records an audit entry including the generated login email', async () => {
      usersService.generateUniqueLoginEmail.mockResolvedValue('jupe1@personal.local');
      employeesRepository.create.mockResolvedValue(makeEmployeeRow());
      usersService.create.mockResolvedValue(makeCreatedUser());
      employeesRepository.setUserId.mockResolvedValue(makeEmployeeRow({ user_id: 'user-1' }));

      await service.create(
        { businessId, branchId, roleId: 'role-1', firstName: 'Juan', lastName: 'Perez' },
        actorUserId,
      );

      expect(auditService.record).toHaveBeenCalledWith(
        expect.objectContaining({
          entityType: 'employee',
          action: 'CREATE',
          newValues: expect.objectContaining({ loginEmail: 'jupe1@personal.local' }),
        }),
      );
    });
  });

  describe('generateCredentials', () => {
    it('throws when the employee already has credentials', async () => {
      employeesRepository.findById.mockResolvedValue(
        makeEmployeeRow({ user_id: 'existing-user' }),
      );

      await expect(
        service.generateCredentials(businessId, 'employee-1', { roleId: 'role-1' }),
      ).rejects.toThrow(BusinessRuleException);
    });

    it('auto-generates a login email and uses the fixed default password for a legacy employee', async () => {
      employeesRepository.findById.mockResolvedValue(makeEmployeeRow());
      usersService.generateUniqueLoginEmail.mockResolvedValue('jupe1@personal.local');
      const createdUser = makeCreatedUser();
      usersService.create.mockResolvedValue(createdUser);
      employeesRepository.setUserId.mockResolvedValue(
        makeEmployeeRow({ user_id: createdUser.id }),
      );

      const result = await service.generateCredentials(businessId, 'employee-1', {
        roleId: 'role-1',
      });

      expect(usersService.create).toHaveBeenCalledWith(
        businessId,
        expect.objectContaining({
          email: 'jupe1@personal.local',
          password: DEFAULT_EMPLOYEE_PASSWORD,
          mustChangePassword: true,
        }),
        undefined,
      );
      expect(result.userAccount?.email).toBe('jupe1@personal.local');
    });
  });

  describe('resetCredentials', () => {
    it('throws when the employee has no login credentials', async () => {
      employeesRepository.findById.mockResolvedValue(makeEmployeeRow({ user_id: null }));

      await expect(service.resetCredentials(businessId, 'employee-1')).rejects.toThrow(
        BusinessRuleException,
      );
    });

    it('generates a random one-time password and forces a change on next login', async () => {
      employeesRepository.findById.mockResolvedValue(
        makeEmployeeRow({ user_id: 'user-1' }),
      );

      const result = await service.resetCredentials(businessId, 'employee-1', actorUserId);

      expect(usersService.setPasswordHash).toHaveBeenCalledWith(
        'user-1',
        result.temporaryPassword,
        true,
      );
      expect(result.temporaryPassword).toEqual(expect.any(String));
    });
  });
});
