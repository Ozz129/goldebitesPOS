import { Inject, Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import {
  ConflictException,
  EntityNotFoundException,
} from '../../../common/exceptions';
import { DbClient } from '../../../database/types/database.types';
import { PaginatedResult } from '../../../common/pagination/paginated-result.interface';
import { buildPaginationMeta } from '../../../common/pagination/pagination.util';
import { buildLoginHandleBase } from '../../../common/utils/generate-login-handle.util';
import { AuditService } from '../../audit/services/audit.service';
import { BranchesService } from '../../branches/services/branches.service';
import { RolesService } from '../../roles/services/roles.service';
import { User, UserRow } from '../domain/user.interface';
import {
  CreateUserData,
  UpdateUserData,
  UserQuery,
  UserStatus,
} from '../domain/user.types';
import { UserMapper } from '../mappers/user.mapper';
import { USERS_REPOSITORY } from '../repositories/users.repository.interface';
import type { IUsersRepository } from '../repositories/users.repository.interface';

const BCRYPT_ROUNDS = 10;
const LOGIN_HANDLE_DOMAIN = 'personal.local';
const LOGIN_HANDLE_MAX_ATTEMPTS = 9999;

@Injectable()
export class UsersService {
  constructor(
    @Inject(USERS_REPOSITORY)
    private readonly usersRepository: IUsersRepository,
    private readonly rolesService: RolesService,
    private readonly branchesService: BranchesService,
    private readonly auditService: AuditService,
  ) {}

  async create(
    businessId: string,
    data: Omit<CreateUserData, 'businessId' | 'passwordHash'> & {
      password: string;
    },
    actorUserId?: string,
    client?: DbClient,
  ): Promise<User> {
    await this.assertRoleOwnedByBusiness(businessId, data.roleId);
    if (data.branchId) {
      await this.branchesService.findOne(businessId, data.branchId);
    }

    const emailTaken = await this.usersRepository.existsByEmailInBusiness(
      businessId,
      data.email,
    );
    if (emailTaken) {
      throw new ConflictException(
        `A user with email "${data.email}" already exists`,
        'USER_EMAIL_TAKEN',
      );
    }

    const passwordHash = await this.hashPassword(data.password);
    const row = await this.usersRepository.create(
      {
        businessId,
        branchId: data.branchId,
        roleId: data.roleId,
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        passwordHash,
        phone: data.phone,
        mustChangePassword: data.mustChangePassword,
      },
      client,
    );

    await this.auditService.record(
      {
        businessId,
        branchId: row.branch_id,
        userId: actorUserId,
        entityType: 'user',
        entityId: row.id,
        action: 'CREATE',
        newValues: { email: row.email, roleId: row.role_id },
      },
      client,
    );

    return UserMapper.toDomain(row);
  }

  async findAll(query: UserQuery): Promise<PaginatedResult<User>> {
    const { rows, total } = await this.usersRepository.findAll(query);
    return {
      data: rows.map((row) => UserMapper.toDomain(row)),
      meta: buildPaginationMeta(query.page, query.limit, total),
    };
  }

  async findOne(businessId: string, id: string): Promise<User> {
    const row = await this.getOwnedUserOrFail(businessId, id);
    return UserMapper.toDomain(row);
  }

  async update(
    businessId: string,
    id: string,
    data: UpdateUserData,
    actorUserId?: string,
  ): Promise<User> {
    await this.getOwnedUserOrFail(businessId, id);

    if (data.roleId) {
      await this.assertRoleOwnedByBusiness(businessId, data.roleId);
    }
    if (data.branchId) {
      await this.branchesService.findOne(businessId, data.branchId);
    }

    const row = await this.usersRepository.update(id, businessId, data);
    if (!row) {
      throw new EntityNotFoundException('User', id);
    }

    await this.auditService.record({
      businessId,
      branchId: row.branch_id,
      userId: actorUserId,
      entityType: 'user',
      entityId: id,
      action: 'UPDATE',
      newValues: data as Record<string, unknown>,
    });

    return UserMapper.toDomain(row);
  }

  async setStatus(
    businessId: string,
    id: string,
    status: UserStatus,
    actorUserId?: string,
  ): Promise<User> {
    await this.getOwnedUserOrFail(businessId, id);
    const row = await this.usersRepository.setStatus(id, businessId, status);
    if (!row) {
      throw new EntityNotFoundException('User', id);
    }
    await this.auditService.record({
      businessId,
      userId: actorUserId,
      entityType: 'user',
      entityId: id,
      action: 'STATUS_CHANGE',
      newValues: { status },
    });
    return UserMapper.toDomain(row);
  }

  async softDelete(
    businessId: string,
    id: string,
    actorUserId?: string,
  ): Promise<void> {
    const row = await this.usersRepository.softDelete(id, businessId);
    if (!row) {
      throw new EntityNotFoundException('User', id);
    }
    await this.auditService.record({
      businessId,
      userId: actorUserId,
      entityType: 'user',
      entityId: id,
      action: 'DELETE',
    });
  }

  // --- Internal helpers consumed by AuthService (raw rows carry password_hash) ---

  async findRawByEmailAcrossBusinesses(
    email: string,
    client?: DbClient,
  ): Promise<UserRow[]> {
    return this.usersRepository.findActiveByEmailAcrossBusinesses(
      email,
      client,
    );
  }

  async findRawById(id: string, businessId: string): Promise<UserRow | null> {
    return this.usersRepository.findById(id, businessId);
  }

  async findRawByIdUnscoped(id: string): Promise<UserRow | null> {
    return this.usersRepository.findByIdUnscoped(id);
  }

  async hashPassword(plain: string): Promise<string> {
    return bcrypt.hash(plain, BCRYPT_ROUNDS);
  }

  async verifyPassword(plain: string, hash: string): Promise<boolean> {
    return bcrypt.compare(plain, hash);
  }

  async setPasswordHash(
    userId: string,
    plainPassword: string,
    mustChangePassword: boolean,
    client?: DbClient,
  ): Promise<void> {
    const passwordHash = await this.hashPassword(plainPassword);
    await this.usersRepository.updatePasswordHash(
      userId,
      passwordHash,
      mustChangePassword,
      client,
    );
  }

  /**
   * Builds a login handle from the employee's name (e.g. "Juan"+"Pérez" ->
   * "jupe1@personal.local"), appending the first available disambiguating
   * number scoped to this business. Used for auto-provisioned employee
   * accounts, where there's no real email to log in with.
   */
  async generateUniqueLoginEmail(
    businessId: string,
    firstName: string,
    lastName: string,
  ): Promise<string> {
    const base = buildLoginHandleBase(firstName, lastName);
    for (let n = 1; n <= LOGIN_HANDLE_MAX_ATTEMPTS; n++) {
      const candidate = `${base}${n}@${LOGIN_HANDLE_DOMAIN}`;
      const taken = await this.usersRepository.existsByEmailInBusiness(
        businessId,
        candidate,
      );
      if (!taken) {
        return candidate;
      }
    }
    throw new ConflictException(
      `Could not generate a unique login for "${firstName} ${lastName}"`,
      'LOGIN_HANDLE_EXHAUSTED',
    );
  }

  async touchLastLogin(userId: string, client?: DbClient): Promise<void> {
    await this.usersRepository.updateLastLoginAt(userId, client);
  }

  private async assertRoleOwnedByBusiness(
    businessId: string,
    roleId: string,
  ): Promise<void> {
    await this.rolesService.findOne(businessId, roleId);
  }

  private async getOwnedUserOrFail(
    businessId: string,
    id: string,
  ): Promise<UserRow> {
    const row = await this.usersRepository.findById(id, businessId);
    if (!row) {
      throw new EntityNotFoundException('User', id);
    }
    return row;
  }
}
