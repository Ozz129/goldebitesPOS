import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../../database/database.service';
import { getOffset } from '../../../common/pagination/pagination.util';
import { DbClient } from '../../../database/types/database.types';
import { CustomerAddressRow, CustomerRow } from '../domain/customer.interface';
import {
  CreateCustomerAddressData,
  CreateCustomerData,
  CustomerQuery,
  UpdateCustomerData,
} from '../domain/customer.types';
import { ICustomersRepository } from './customers.repository.interface';

const SELECT_COLUMNS = `id, business_id, first_name, last_name, email, phone, document_number,
  birth_date, notes, total_orders, total_spent, loyalty_points, created_at, updated_at, deleted_at`;

const ADDRESS_COLUMNS = `id, customer_id, label, address, city, instructions, is_default, created_at`;

interface CountRow {
  count: string;
}

@Injectable()
export class CustomersRepository implements ICustomersRepository {
  constructor(private readonly db: DatabaseService) {}

  async create(
    data: CreateCustomerData,
    client?: DbClient,
  ): Promise<CustomerRow> {
    const result = await this.db.query<CustomerRow>(
      `INSERT INTO customers (business_id, first_name, last_name, email, phone, document_number, birth_date, notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING ${SELECT_COLUMNS}`,
      [
        data.businessId,
        data.firstName,
        data.lastName ?? null,
        data.email ?? null,
        data.phone ?? null,
        data.documentNumber ?? null,
        data.birthDate ?? null,
        data.notes ?? null,
      ],
      client,
    );
    return result.rows[0];
  }

  async findById(
    id: string,
    businessId: string,
    client?: DbClient,
  ): Promise<CustomerRow | null> {
    const result = await this.db.query<CustomerRow>(
      `SELECT ${SELECT_COLUMNS} FROM customers
       WHERE id = $1 AND business_id = $2 AND deleted_at IS NULL`,
      [id, businessId],
      client,
    );
    return result.rows[0] ?? null;
  }

  async findAll(
    query: CustomerQuery,
  ): Promise<{ rows: CustomerRow[]; total: number }> {
    const conditions: string[] = ['business_id = $1', 'deleted_at IS NULL'];
    const params: unknown[] = [query.businessId];

    if (query.search) {
      params.push(`%${query.search}%`);
      const idx = params.length;
      conditions.push(
        `(first_name ILIKE $${idx} OR last_name ILIKE $${idx} OR phone ILIKE $${idx} OR email ILIKE $${idx})`,
      );
    }

    const whereClause = conditions.join(' AND ');

    const countResult = await this.db.query<CountRow>(
      `SELECT COUNT(*)::text AS count FROM customers WHERE ${whereClause}`,
      params,
    );
    const total = parseInt(countResult.rows[0]?.count ?? '0', 10);

    const dataParams = [
      ...params,
      query.limit,
      getOffset(query.page, query.limit),
    ];
    const rowsResult = await this.db.query<CustomerRow>(
      `SELECT ${SELECT_COLUMNS}
       FROM customers
       WHERE ${whereClause}
       ORDER BY first_name, last_name
       LIMIT $${dataParams.length - 1} OFFSET $${dataParams.length}`,
      dataParams,
    );

    return { rows: rowsResult.rows, total };
  }

  async update(
    id: string,
    businessId: string,
    data: UpdateCustomerData,
  ): Promise<CustomerRow | null> {
    const result = await this.db.query<CustomerRow>(
      `UPDATE customers
       SET first_name = COALESCE($3, first_name),
           last_name = COALESCE($4, last_name),
           email = COALESCE($5, email),
           phone = COALESCE($6, phone),
           document_number = COALESCE($7, document_number),
           birth_date = COALESCE($8, birth_date),
           notes = COALESCE($9, notes)
       WHERE id = $1 AND business_id = $2 AND deleted_at IS NULL
       RETURNING ${SELECT_COLUMNS}`,
      [
        id,
        businessId,
        data.firstName ?? null,
        data.lastName ?? null,
        data.email ?? null,
        data.phone ?? null,
        data.documentNumber ?? null,
        data.birthDate ?? null,
        data.notes ?? null,
      ],
    );
    return result.rows[0] ?? null;
  }

  async softDelete(
    id: string,
    businessId: string,
  ): Promise<CustomerRow | null> {
    const result = await this.db.query<CustomerRow>(
      `UPDATE customers SET deleted_at = now()
       WHERE id = $1 AND business_id = $2 AND deleted_at IS NULL
       RETURNING ${SELECT_COLUMNS}`,
      [id, businessId],
    );
    return result.rows[0] ?? null;
  }

  async incrementStats(
    id: string,
    amountSpent: number,
    client?: DbClient,
  ): Promise<void> {
    await this.db.query(
      `UPDATE customers
       SET total_orders = total_orders + 1, total_spent = total_spent + $2::numeric
       WHERE id = $1`,
      [id, amountSpent],
      client,
    );
  }

  async adjustLoyaltyPoints(
    id: string,
    delta: number,
    client?: DbClient,
  ): Promise<CustomerRow | null> {
    const result = await this.db.query<CustomerRow>(
      `UPDATE customers SET loyalty_points = loyalty_points + $2
       WHERE id = $1 AND deleted_at IS NULL AND loyalty_points + $2 >= 0
       RETURNING ${SELECT_COLUMNS}`,
      [id, delta],
      client,
    );
    return result.rows[0] ?? null;
  }

  async createAddress(
    customerId: string,
    data: CreateCustomerAddressData,
    client?: DbClient,
  ): Promise<CustomerAddressRow> {
    if (data.isDefault) {
      await this.db.query(
        `UPDATE customer_addresses SET is_default = false WHERE customer_id = $1`,
        [customerId],
        client,
      );
    }
    const result = await this.db.query<CustomerAddressRow>(
      `INSERT INTO customer_addresses (customer_id, label, address, city, instructions, is_default)
       VALUES ($1, $2, $3, $4, $5, COALESCE($6, false))
       RETURNING ${ADDRESS_COLUMNS}`,
      [
        customerId,
        data.label ?? null,
        data.address,
        data.city ?? null,
        data.instructions ?? null,
        data.isDefault ?? null,
      ],
      client,
    );
    return result.rows[0];
  }

  async findAddresses(customerId: string): Promise<CustomerAddressRow[]> {
    const result = await this.db.query<CustomerAddressRow>(
      `SELECT ${ADDRESS_COLUMNS} FROM customer_addresses
       WHERE customer_id = $1
       ORDER BY is_default DESC, created_at DESC`,
      [customerId],
    );
    return result.rows;
  }

  async deleteAddress(id: string, customerId: string): Promise<boolean> {
    const result = await this.db.query(
      `DELETE FROM customer_addresses WHERE id = $1 AND customer_id = $2`,
      [id, customerId],
    );
    return (result.rowCount ?? 0) > 0;
  }
}
