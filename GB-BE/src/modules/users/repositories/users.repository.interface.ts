import { DbClient } from '../../../database/types/database.types';
import { UserRow } from '../domain/user.interface';
import {
  CreateUserData,
  UpdateUserData,
  UserQuery,
  UserStatus,
} from '../domain/user.types';

export interface IUsersRepository {
  create(data: CreateUserData, client?: DbClient): Promise<UserRow>;
  findById(
    id: string,
    businessId: string,
    client?: DbClient,
  ): Promise<UserRow | null>;
  /** Not scoped by business — used for refresh-token flows where only the userId is known. */
  findByIdUnscoped(id: string, client?: DbClient): Promise<UserRow | null>;
  /** Not scoped by business — used for login, where the tenant is not yet known. */
  findActiveByEmailAcrossBusinesses(
    email: string,
    client?: DbClient,
  ): Promise<UserRow[]>;
  findAll(query: UserQuery): Promise<{ rows: UserRow[]; total: number }>;
  update(
    id: string,
    businessId: string,
    data: UpdateUserData,
    client?: DbClient,
  ): Promise<UserRow | null>;
  updatePasswordHash(
    id: string,
    passwordHash: string,
    client?: DbClient,
  ): Promise<void>;
  updateLastLoginAt(id: string, client?: DbClient): Promise<void>;
  setStatus(
    id: string,
    businessId: string,
    status: UserStatus,
    client?: DbClient,
  ): Promise<UserRow | null>;
  softDelete(
    id: string,
    businessId: string,
    client?: DbClient,
  ): Promise<UserRow | null>;
  existsByEmailInBusiness(
    businessId: string,
    email: string,
    excludeId?: string,
  ): Promise<boolean>;
}

export const USERS_REPOSITORY = Symbol('USERS_REPOSITORY');
