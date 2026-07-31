import { Inject, Injectable } from '@nestjs/common';
import {
  BusinessRuleException,
  EntityNotFoundException,
} from '../../../common/exceptions';
import { PaginatedResult } from '../../../common/pagination/paginated-result.interface';
import { buildPaginationMeta } from '../../../common/pagination/pagination.util';
import { DbClient } from '../../../database/types/database.types';
import { TransactionService } from '../../../database/transaction.service';
import { AuditService } from '../../audit/services/audit.service';
import {
  Customer,
  CustomerAddress,
  CustomerRow,
} from '../domain/customer.interface';
import {
  CreateCustomerAddressData,
  CreateCustomerData,
  CustomerQuery,
  UpdateCustomerData,
} from '../domain/customer.types';
import { CustomerMapper } from '../mappers/customer.mapper';
import { CUSTOMERS_REPOSITORY } from '../repositories/customers.repository.interface';
import type { ICustomersRepository } from '../repositories/customers.repository.interface';

@Injectable()
export class CustomersService {
  constructor(
    @Inject(CUSTOMERS_REPOSITORY)
    private readonly customersRepository: ICustomersRepository,
    private readonly transactionService: TransactionService,
    private readonly auditService: AuditService,
  ) {}

  async create(
    data: CreateCustomerData,
    actorUserId?: string,
  ): Promise<Customer> {
    const row = await this.customersRepository.create(data);
    await this.auditService.record({
      businessId: data.businessId,
      userId: actorUserId,
      entityType: 'customer',
      entityId: row.id,
      action: 'CREATE',
      newValues: { firstName: row.first_name, phone: row.phone },
    });
    return CustomerMapper.toDomain(row);
  }

  async findAll(query: CustomerQuery): Promise<PaginatedResult<Customer>> {
    const { rows, total } = await this.customersRepository.findAll(query);
    return {
      data: rows.map((row) => CustomerMapper.toDomain(row)),
      meta: buildPaginationMeta(query.page, query.limit, total),
    };
  }

  async findOne(businessId: string, id: string): Promise<Customer> {
    const row = await this.getOwnedOrFail(businessId, id);
    return CustomerMapper.toDomain(row);
  }

  async update(
    businessId: string,
    id: string,
    data: UpdateCustomerData,
    actorUserId?: string,
  ): Promise<Customer> {
    await this.getOwnedOrFail(businessId, id);
    const row = await this.customersRepository.update(id, businessId, data);
    if (!row) {
      throw new EntityNotFoundException('Customer', id);
    }
    await this.auditService.record({
      businessId,
      userId: actorUserId,
      entityType: 'customer',
      entityId: id,
      action: 'UPDATE',
      newValues: data as Record<string, unknown>,
    });
    return CustomerMapper.toDomain(row);
  }

  async softDelete(
    businessId: string,
    id: string,
    actorUserId?: string,
  ): Promise<void> {
    const row = await this.customersRepository.softDelete(id, businessId);
    if (!row) {
      throw new EntityNotFoundException('Customer', id);
    }
    await this.auditService.record({
      businessId,
      userId: actorUserId,
      entityType: 'customer',
      entityId: id,
      action: 'DELETE',
    });
  }

  /** Used by OrdersService when a DELIVERED order is tied to a customer. */
  async recordCompletedOrder(
    customerId: string,
    amountSpent: number,
    client?: DbClient,
  ): Promise<void> {
    await this.customersRepository.incrementStats(
      customerId,
      amountSpent,
      client,
    );
  }

  /** Used by LoyaltyService to award/redeem points; delta may be negative. */
  async adjustLoyaltyPoints(
    businessId: string,
    customerId: string,
    delta: number,
    client?: DbClient,
  ): Promise<Customer> {
    await this.getOwnedOrFail(businessId, customerId);
    const row = await this.customersRepository.adjustLoyaltyPoints(
      customerId,
      delta,
      client,
    );
    if (!row) {
      throw new BusinessRuleException(
        'Customer does not have enough loyalty points',
        'LOYALTY_POINTS_INSUFFICIENT',
      );
    }
    return CustomerMapper.toDomain(row);
  }

  async addAddress(
    businessId: string,
    customerId: string,
    data: CreateCustomerAddressData,
  ): Promise<CustomerAddress> {
    await this.getOwnedOrFail(businessId, customerId);
    const row = await this.transactionService.execute((client) =>
      this.customersRepository.createAddress(customerId, data, client),
    );
    return CustomerMapper.addressToDomain(row);
  }

  async listAddresses(
    businessId: string,
    customerId: string,
  ): Promise<CustomerAddress[]> {
    await this.getOwnedOrFail(businessId, customerId);
    const rows = await this.customersRepository.findAddresses(customerId);
    return rows.map((row) => CustomerMapper.addressToDomain(row));
  }

  async removeAddress(
    businessId: string,
    customerId: string,
    addressId: string,
  ): Promise<void> {
    await this.getOwnedOrFail(businessId, customerId);
    const deleted = await this.customersRepository.deleteAddress(
      addressId,
      customerId,
    );
    if (!deleted) {
      throw new EntityNotFoundException('CustomerAddress', addressId);
    }
  }

  /** Used by OrdersService to validate customerId ownership before attaching it to an order. */
  async getOwnedOrFail(businessId: string, id: string): Promise<CustomerRow> {
    const row = await this.customersRepository.findById(id, businessId);
    if (!row) {
      throw new EntityNotFoundException('Customer', id);
    }
    return row;
  }
}
