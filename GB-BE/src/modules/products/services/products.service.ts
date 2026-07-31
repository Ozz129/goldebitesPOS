import { Inject, Injectable } from '@nestjs/common';
import {
  ConflictException,
  EntityNotFoundException,
} from '../../../common/exceptions';
import { DbClient } from '../../../database/types/database.types';
import { PaginatedResult } from '../../../common/pagination/paginated-result.interface';
import { buildPaginationMeta } from '../../../common/pagination/pagination.util';
import { AuditService } from '../../audit/services/audit.service';
import { ProductCategoriesService } from '../../product-categories/services/product-categories.service';
import {
  Product,
  ProductMargin,
  ProductRow,
} from '../domain/product.interface';
import {
  CreateProductData,
  ProductQuery,
  UpdateProductData,
} from '../domain/product.types';
import { ProductMapper } from '../mappers/product.mapper';
import { PRODUCTS_REPOSITORY } from '../repositories/products.repository.interface';
import type { IProductsRepository } from '../repositories/products.repository.interface';

@Injectable()
export class ProductsService {
  constructor(
    @Inject(PRODUCTS_REPOSITORY)
    private readonly productsRepository: IProductsRepository,
    private readonly categoriesService: ProductCategoriesService,
    private readonly auditService: AuditService,
  ) {}

  async create(
    data: CreateProductData,
    actorUserId?: string,
  ): Promise<Product> {
    if (data.categoryId) {
      await this.categoriesService.findOne(data.businessId, data.categoryId);
    }
    if (data.sku) {
      await this.assertSkuFree(data.businessId, data.sku);
    }

    const row = await this.productsRepository.create(data);
    await this.auditService.record({
      businessId: data.businessId,
      userId: actorUserId,
      entityType: 'product',
      entityId: row.id,
      action: 'CREATE',
      newValues: { name: row.name, sku: row.sku },
    });
    return ProductMapper.toDomain(row);
  }

  async findAll(query: ProductQuery): Promise<PaginatedResult<Product>> {
    const { rows, total } = await this.productsRepository.findAll(query);
    return {
      data: rows.map((row) => ProductMapper.toDomain(row)),
      meta: buildPaginationMeta(query.page, query.limit, total),
    };
  }

  async findAvailableForSale(businessId: string): Promise<Product[]> {
    const rows = await this.productsRepository.findAvailableForSale(businessId);
    return rows.map((row) => ProductMapper.toDomain(row));
  }

  async findOne(businessId: string, id: string): Promise<Product> {
    const row = await this.getOwnedOrFail(businessId, id);
    return ProductMapper.toDomain(row);
  }

  async getMargin(businessId: string, id: string): Promise<ProductMargin> {
    const row = await this.getOwnedOrFail(businessId, id);
    const salePrice = parseFloat(row.sale_price);
    const currentCost = parseFloat(row.current_cost);
    const marginAmount = round2(salePrice - currentCost);
    const marginPercent =
      salePrice > 0 ? round2((marginAmount / salePrice) * 100) : 0;
    return { salePrice, currentCost, marginAmount, marginPercent };
  }

  async update(
    businessId: string,
    id: string,
    data: UpdateProductData,
    actorUserId?: string,
  ): Promise<Product> {
    await this.getOwnedOrFail(businessId, id);

    if (data.categoryId) {
      await this.categoriesService.findOne(businessId, data.categoryId);
    }
    if (data.sku) {
      await this.assertSkuFree(businessId, data.sku, id);
    }

    const row = await this.productsRepository.update(id, businessId, data);
    if (!row) {
      throw new EntityNotFoundException('Product', id);
    }
    await this.auditService.record({
      businessId,
      userId: actorUserId,
      entityType: 'product',
      entityId: id,
      action: 'UPDATE',
      newValues: data as Record<string, unknown>,
    });
    return ProductMapper.toDomain(row);
  }

  async setActive(
    businessId: string,
    id: string,
    isActive: boolean,
    actorUserId?: string,
  ): Promise<Product> {
    await this.getOwnedOrFail(businessId, id);
    const row = await this.productsRepository.setActive(
      id,
      businessId,
      isActive,
    );
    if (!row) {
      throw new EntityNotFoundException('Product', id);
    }
    await this.auditService.record({
      businessId,
      userId: actorUserId,
      entityType: 'product',
      entityId: id,
      action: isActive ? 'ACTIVATE' : 'DEACTIVATE',
    });
    return ProductMapper.toDomain(row);
  }

  async softDelete(
    businessId: string,
    id: string,
    actorUserId?: string,
  ): Promise<void> {
    const row = await this.productsRepository.softDelete(id, businessId);
    if (!row) {
      throw new EntityNotFoundException('Product', id);
    }
    await this.auditService.record({
      businessId,
      userId: actorUserId,
      entityType: 'product',
      entityId: id,
      action: 'DELETE',
    });
  }

  /** Used by RecipesService: syncs the product's current_cost to its recipe cost. */
  async syncCostFromRecipe(
    businessId: string,
    productId: string,
    currentCost: number,
    client?: DbClient,
  ): Promise<void> {
    await this.productsRepository.setCurrentCost(
      productId,
      businessId,
      round2(currentCost),
      client,
    );
  }

  /** Used by RecipesService to validate product ownership before attaching a recipe. */
  async getOwnedOrFail(businessId: string, id: string): Promise<ProductRow> {
    const row = await this.productsRepository.findById(id, businessId);
    if (!row) {
      throw new EntityNotFoundException('Product', id);
    }
    return row;
  }

  private async assertSkuFree(
    businessId: string,
    sku: string,
    excludeId?: string,
  ): Promise<void> {
    const taken = await this.productsRepository.existsBySku(
      businessId,
      sku,
      excludeId,
    );
    if (taken) {
      throw new ConflictException(
        `SKU "${sku}" is already in use`,
        'PRODUCT_SKU_TAKEN',
      );
    }
  }
}

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}
