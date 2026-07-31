import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../../database/database.service';
import { getOffset } from '../../../common/pagination/pagination.util';
import { DbClient } from '../../../database/types/database.types';
import { ProductCategoryRow } from '../domain/product-category.interface';
import {
  CreateProductCategoryData,
  ProductCategoryQuery,
  UpdateProductCategoryData,
} from '../domain/product-category.types';
import { IProductCategoriesRepository } from './product-categories.repository.interface';

const SELECT_COLUMNS = `id, business_id, name, description, display_order, is_active, created_at, updated_at`;

interface CountRow {
  count: string;
}

@Injectable()
export class ProductCategoriesRepository implements IProductCategoriesRepository {
  constructor(private readonly db: DatabaseService) {}

  async create(
    data: CreateProductCategoryData,
    client?: DbClient,
  ): Promise<ProductCategoryRow> {
    const result = await this.db.query<ProductCategoryRow>(
      `INSERT INTO product_categories (business_id, name, description, display_order)
       VALUES ($1, $2, $3, COALESCE($4, 0))
       RETURNING ${SELECT_COLUMNS}`,
      [
        data.businessId,
        data.name,
        data.description ?? null,
        data.displayOrder ?? null,
      ],
      client,
    );
    return result.rows[0];
  }

  async findById(
    id: string,
    businessId: string,
    client?: DbClient,
  ): Promise<ProductCategoryRow | null> {
    const result = await this.db.query<ProductCategoryRow>(
      `SELECT ${SELECT_COLUMNS} FROM product_categories WHERE id = $1 AND business_id = $2`,
      [id, businessId],
      client,
    );
    return result.rows[0] ?? null;
  }

  async findAll(
    query: ProductCategoryQuery,
  ): Promise<{ rows: ProductCategoryRow[]; total: number }> {
    const conditions: string[] = ['business_id = $1'];
    const params: unknown[] = [query.businessId];

    if (query.isActive !== undefined) {
      params.push(query.isActive);
      conditions.push(`is_active = $${params.length}`);
    }

    if (query.search) {
      params.push(`%${query.search}%`);
      conditions.push(`name ILIKE $${params.length}`);
    }

    const whereClause = conditions.join(' AND ');

    const countResult = await this.db.query<CountRow>(
      `SELECT COUNT(*)::text AS count FROM product_categories WHERE ${whereClause}`,
      params,
    );
    const total = parseInt(countResult.rows[0]?.count ?? '0', 10);

    const dataParams = [
      ...params,
      query.limit,
      getOffset(query.page, query.limit),
    ];
    const rowsResult = await this.db.query<ProductCategoryRow>(
      `SELECT ${SELECT_COLUMNS}
       FROM product_categories
       WHERE ${whereClause}
       ORDER BY display_order, name
       LIMIT $${dataParams.length - 1} OFFSET $${dataParams.length}`,
      dataParams,
    );

    return { rows: rowsResult.rows, total };
  }

  async update(
    id: string,
    businessId: string,
    data: UpdateProductCategoryData,
    client?: DbClient,
  ): Promise<ProductCategoryRow | null> {
    const result = await this.db.query<ProductCategoryRow>(
      `UPDATE product_categories
       SET name = COALESCE($3, name),
           description = COALESCE($4, description),
           display_order = COALESCE($5, display_order)
       WHERE id = $1 AND business_id = $2
       RETURNING ${SELECT_COLUMNS}`,
      [
        id,
        businessId,
        data.name ?? null,
        data.description ?? null,
        data.displayOrder ?? null,
      ],
      client,
    );
    return result.rows[0] ?? null;
  }

  async setActive(
    id: string,
    businessId: string,
    isActive: boolean,
  ): Promise<ProductCategoryRow | null> {
    const result = await this.db.query<ProductCategoryRow>(
      `UPDATE product_categories SET is_active = $3
       WHERE id = $1 AND business_id = $2
       RETURNING ${SELECT_COLUMNS}`,
      [id, businessId, isActive],
    );
    return result.rows[0] ?? null;
  }

  async existsByName(
    businessId: string,
    name: string,
    excludeId?: string,
  ): Promise<boolean> {
    const result = await this.db.query<{ id: string }>(
      `SELECT id FROM product_categories
       WHERE business_id = $1 AND name = $2 AND ($3::uuid IS NULL OR id != $3)`,
      [businessId, name, excludeId ?? null],
    );
    return result.rows.length > 0;
  }
}
