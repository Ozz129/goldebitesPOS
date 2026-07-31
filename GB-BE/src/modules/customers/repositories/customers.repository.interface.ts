import { DbClient } from '../../../database/types/database.types';
import { CustomerAddressRow, CustomerRow } from '../domain/customer.interface';
import {
  CreateCustomerAddressData,
  CreateCustomerData,
  CustomerQuery,
  UpdateCustomerData,
} from '../domain/customer.types';

export interface ICustomersRepository {
  create(data: CreateCustomerData, client?: DbClient): Promise<CustomerRow>;
  findById(
    id: string,
    businessId: string,
    client?: DbClient,
  ): Promise<CustomerRow | null>;
  findAll(
    query: CustomerQuery,
  ): Promise<{ rows: CustomerRow[]; total: number }>;
  update(
    id: string,
    businessId: string,
    data: UpdateCustomerData,
  ): Promise<CustomerRow | null>;
  softDelete(id: string, businessId: string): Promise<CustomerRow | null>;
  incrementStats(
    id: string,
    amountSpent: number,
    client?: DbClient,
  ): Promise<void>;
  adjustLoyaltyPoints(
    id: string,
    delta: number,
    client?: DbClient,
  ): Promise<CustomerRow | null>;
  createAddress(
    customerId: string,
    data: CreateCustomerAddressData,
    client?: DbClient,
  ): Promise<CustomerAddressRow>;
  findAddresses(customerId: string): Promise<CustomerAddressRow[]>;
  deleteAddress(id: string, customerId: string): Promise<boolean>;
}

export const CUSTOMERS_REPOSITORY = Symbol('CUSTOMERS_REPOSITORY');
