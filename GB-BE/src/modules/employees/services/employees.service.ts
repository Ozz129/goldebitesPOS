import { Inject, Injectable } from '@nestjs/common';
import {
  BusinessRuleException,
  EntityNotFoundException,
} from '../../../common/exceptions';
import { PaginatedResult } from '../../../common/pagination/paginated-result.interface';
import { buildPaginationMeta } from '../../../common/pagination/pagination.util';
import { generateTemporaryPassword } from '../../../common/utils/generate-password.util';
import { TransactionService } from '../../../database/transaction.service';
import { AuditService } from '../../audit/services/audit.service';
import { UserStatus } from '../../users/domain/user.types';
import { UsersService } from '../../users/services/users.service';
import {
  Employee,
  EmployeeRow,
  EmployeeUserAccount,
  EmployeeWithShifts,
} from '../domain/employee.interface';
import {
  CreateEmployeeData,
  EmployeeQuery,
  EmployeeStatus,
  ShiftInput,
  UpdateEmployeeData,
} from '../domain/employee.types';
import { EmployeeMapper } from '../mappers/employee.mapper';
import { EMPLOYEES_REPOSITORY } from '../repositories/employees.repository.interface';
import type { IEmployeesRepository } from '../repositories/employees.repository.interface';

export interface GenerateEmployeeCredentialsInput {
  email: string;
  roleId: string;
  branchId?: string;
}

@Injectable()
export class EmployeesService {
  constructor(
    @Inject(EMPLOYEES_REPOSITORY)
    private readonly employeesRepository: IEmployeesRepository,
    private readonly usersService: UsersService,
    private readonly transactionService: TransactionService,
    private readonly auditService: AuditService,
  ) {}

  async create(
    data: CreateEmployeeData,
    actorUserId?: string,
  ): Promise<Employee> {
    const row = await this.employeesRepository.create(data);
    await this.auditService.record({
      businessId: data.businessId,
      branchId: data.branchId,
      userId: actorUserId,
      entityType: 'employee',
      entityId: row.id,
      action: 'CREATE',
      newValues: { firstName: row.first_name, lastName: row.last_name },
    });
    return EmployeeMapper.toDomain(row);
  }

  async findAll(query: EmployeeQuery): Promise<PaginatedResult<Employee>> {
    const { rows, total } = await this.employeesRepository.findAll(query);
    return {
      data: rows.map((row) => EmployeeMapper.toDomain(row)),
      meta: buildPaginationMeta(query.page, query.limit, total),
    };
  }

  async findOne(businessId: string, id: string): Promise<EmployeeWithShifts> {
    const row = await this.getOwnedOrFail(businessId, id);
    const shiftRows = await this.employeesRepository.findShifts(id);
    const userAccount = await this.loadUserAccount(businessId, row.user_id);
    return {
      ...EmployeeMapper.toDomain(row),
      shifts: shiftRows.map((shift) => EmployeeMapper.shiftToDomain(shift)),
      userAccount,
    };
  }

  async update(
    businessId: string,
    id: string,
    data: UpdateEmployeeData,
    actorUserId?: string,
  ): Promise<Employee> {
    await this.getOwnedOrFail(businessId, id);
    const row = await this.employeesRepository.update(id, businessId, data);
    if (!row) {
      throw new EntityNotFoundException('Employee', id);
    }
    await this.auditService.record({
      businessId,
      userId: actorUserId,
      entityType: 'employee',
      entityId: id,
      action: 'UPDATE',
      newValues: data as Record<string, unknown>,
    });
    return EmployeeMapper.toDomain(row);
  }

  async setStatus(
    businessId: string,
    id: string,
    status: EmployeeStatus,
    actorUserId?: string,
  ): Promise<Employee> {
    await this.getOwnedOrFail(businessId, id);
    const row = await this.employeesRepository.setStatus(
      id,
      businessId,
      status,
    );
    if (!row) {
      throw new EntityNotFoundException('Employee', id);
    }
    await this.auditService.record({
      businessId,
      userId: actorUserId,
      entityType: 'employee',
      entityId: id,
      action: `STATUS_${status}`,
    });
    return EmployeeMapper.toDomain(row);
  }

  async softDelete(
    businessId: string,
    id: string,
    actorUserId?: string,
  ): Promise<void> {
    await this.getOwnedOrFail(businessId, id);
    const row = await this.employeesRepository.softDelete(id, businessId);
    if (!row) {
      throw new EntityNotFoundException('Employee', id);
    }
    await this.auditService.record({
      businessId,
      userId: actorUserId,
      entityType: 'employee',
      entityId: id,
      action: 'DELETE',
    });
  }

  async replaceShifts(
    businessId: string,
    id: string,
    shifts: ShiftInput[],
    actorUserId?: string,
  ): Promise<EmployeeWithShifts> {
    const row = await this.getOwnedOrFail(businessId, id);
    const shiftRows = await this.transactionService.execute((client) =>
      this.employeesRepository.replaceShifts(id, shifts, client),
    );

    await this.auditService.record({
      businessId,
      userId: actorUserId,
      entityType: 'employee',
      entityId: id,
      action: 'UPDATE_SHIFTS',
      newValues: { shiftCount: shifts.length },
    });

    const userAccount = await this.loadUserAccount(businessId, row.user_id);
    return {
      ...EmployeeMapper.toDomain(row),
      shifts: shiftRows.map((shift) => EmployeeMapper.shiftToDomain(shift)),
      userAccount,
    };
  }

  /** Provisions a login account for an employee that doesn't have one yet. */
  async generateCredentials(
    businessId: string,
    id: string,
    input: GenerateEmployeeCredentialsInput,
    actorUserId?: string,
  ): Promise<{ employee: EmployeeWithShifts; temporaryPassword: string }> {
    const row = await this.getOwnedOrFail(businessId, id);
    if (row.user_id) {
      throw new BusinessRuleException(
        'This employee already has login credentials — use reset instead',
        'EMPLOYEE_CREDENTIALS_ALREADY_EXIST',
      );
    }

    const temporaryPassword = generateTemporaryPassword();
    const user = await this.usersService.create(
      businessId,
      {
        firstName: row.first_name,
        lastName: row.last_name,
        email: input.email,
        password: temporaryPassword,
        roleId: input.roleId,
        branchId: input.branchId ?? row.branch_id ?? undefined,
        phone: row.phone ?? undefined,
      },
      actorUserId,
    );

    const updatedRow = await this.employeesRepository.setUserId(
      id,
      businessId,
      user.id,
    );
    if (!updatedRow) {
      throw new EntityNotFoundException('Employee', id);
    }

    await this.auditService.record({
      businessId,
      userId: actorUserId,
      entityType: 'employee',
      entityId: id,
      action: 'CREATE_CREDENTIALS',
      newValues: { email: input.email, roleId: input.roleId },
    });

    const shiftRows = await this.employeesRepository.findShifts(id);
    return {
      employee: {
        ...EmployeeMapper.toDomain(updatedRow),
        shifts: shiftRows.map((shift) => EmployeeMapper.shiftToDomain(shift)),
        userAccount: { id: user.id, email: user.email, status: user.status },
      },
      temporaryPassword,
    };
  }

  /** Issues a new temporary password for an employee that already has credentials. */
  async resetCredentials(
    businessId: string,
    id: string,
    actorUserId?: string,
  ): Promise<{ temporaryPassword: string }> {
    const row = await this.getOwnedOrFail(businessId, id);
    if (!row.user_id) {
      throw new BusinessRuleException(
        'This employee has no login credentials to reset',
        'EMPLOYEE_CREDENTIALS_NOT_FOUND',
      );
    }

    const temporaryPassword = generateTemporaryPassword();
    await this.usersService.setPasswordHash(row.user_id, temporaryPassword);

    await this.auditService.record({
      businessId,
      userId: actorUserId,
      entityType: 'employee',
      entityId: id,
      action: 'RESET_CREDENTIALS',
    });

    return { temporaryPassword };
  }

  /** Activates, deactivates or blocks an employee's login access without deleting the account. */
  async setCredentialsStatus(
    businessId: string,
    id: string,
    status: UserStatus,
    actorUserId?: string,
  ): Promise<EmployeeUserAccount> {
    const row = await this.getOwnedOrFail(businessId, id);
    if (!row.user_id) {
      throw new BusinessRuleException(
        'This employee has no login credentials',
        'EMPLOYEE_CREDENTIALS_NOT_FOUND',
      );
    }

    const user = await this.usersService.setStatus(
      businessId,
      row.user_id,
      status,
      actorUserId,
    );

    await this.auditService.record({
      businessId,
      userId: actorUserId,
      entityType: 'employee',
      entityId: id,
      action: 'CREDENTIALS_STATUS_CHANGE',
      newValues: { status },
    });

    return { id: user.id, email: user.email, status: user.status };
  }

  private async loadUserAccount(
    businessId: string,
    userId: string | null,
  ): Promise<EmployeeUserAccount | null> {
    if (!userId) return null;
    const user = await this.usersService.findRawById(userId, businessId);
    if (!user) return null;
    return { id: user.id, email: user.email, status: user.status };
  }

  private async getOwnedOrFail(
    businessId: string,
    id: string,
  ): Promise<EmployeeRow> {
    const row = await this.employeesRepository.findById(id, businessId);
    if (!row) {
      throw new EntityNotFoundException('Employee', id);
    }
    return row;
  }
}
