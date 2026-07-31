import { Inject, Injectable } from '@nestjs/common';
import {
  ConflictException,
  EntityNotFoundException,
} from '../../../common/exceptions';
import { PaginatedResult } from '../../../common/pagination/paginated-result.interface';
import { buildPaginationMeta } from '../../../common/pagination/pagination.util';
import { AuditService } from '../../audit/services/audit.service';
import {
  InventoryItemCategory,
  InventoryItemCategoryRow,
} from '../domain/inventory-item-category.interface';
import {
  CreateInventoryItemCategoryData,
  InventoryItemCategoryQuery,
  UpdateInventoryItemCategoryData,
} from '../domain/inventory-item-category.types';
import { InventoryItemCategoryMapper } from '../mappers/inventory-item-category.mapper';
import { INVENTORY_ITEM_CATEGORIES_REPOSITORY } from '../repositories/inventory-item-categories.repository.interface';
import type { IInventoryItemCategoriesRepository } from '../repositories/inventory-item-categories.repository.interface';

@Injectable()
export class InventoryItemCategoriesService {
  constructor(
    @Inject(INVENTORY_ITEM_CATEGORIES_REPOSITORY)
    private readonly categoriesRepository: IInventoryItemCategoriesRepository,
    private readonly auditService: AuditService,
  ) {}

  async create(
    data: CreateInventoryItemCategoryData,
    actorUserId?: string,
  ): Promise<InventoryItemCategory> {
    const nameTaken = await this.categoriesRepository.existsByName(
      data.businessId,
      data.name,
    );
    if (nameTaken) {
      throw new ConflictException(
        `A category named "${data.name}" already exists`,
        'CATEGORY_NAME_TAKEN',
      );
    }

    const row = await this.categoriesRepository.create(data);
    await this.auditService.record({
      businessId: data.businessId,
      userId: actorUserId,
      entityType: 'inventory_item_category',
      entityId: row.id,
      action: 'CREATE',
      newValues: { name: row.name },
    });
    return InventoryItemCategoryMapper.toDomain(row);
  }

  async findAll(
    query: InventoryItemCategoryQuery,
  ): Promise<PaginatedResult<InventoryItemCategory>> {
    const { rows, total } = await this.categoriesRepository.findAll(query);
    return {
      data: rows.map((row) => InventoryItemCategoryMapper.toDomain(row)),
      meta: buildPaginationMeta(query.page, query.limit, total),
    };
  }

  async findOne(
    businessId: string,
    id: string,
  ): Promise<InventoryItemCategory> {
    const row = await this.getOwnedOrFail(businessId, id);
    return InventoryItemCategoryMapper.toDomain(row);
  }

  async update(
    businessId: string,
    id: string,
    data: UpdateInventoryItemCategoryData,
    actorUserId?: string,
  ): Promise<InventoryItemCategory> {
    await this.getOwnedOrFail(businessId, id);

    if (data.name) {
      const nameTaken = await this.categoriesRepository.existsByName(
        businessId,
        data.name,
        id,
      );
      if (nameTaken) {
        throw new ConflictException(
          `A category named "${data.name}" already exists`,
          'CATEGORY_NAME_TAKEN',
        );
      }
    }

    const row = await this.categoriesRepository.update(id, businessId, data);
    if (!row) {
      throw new EntityNotFoundException('InventoryItemCategory', id);
    }
    await this.auditService.record({
      businessId,
      userId: actorUserId,
      entityType: 'inventory_item_category',
      entityId: id,
      action: 'UPDATE',
      newValues: data as Record<string, unknown>,
    });
    return InventoryItemCategoryMapper.toDomain(row);
  }

  async setActive(
    businessId: string,
    id: string,
    isActive: boolean,
    actorUserId?: string,
  ): Promise<InventoryItemCategory> {
    await this.getOwnedOrFail(businessId, id);
    const row = await this.categoriesRepository.setActive(
      id,
      businessId,
      isActive,
    );
    if (!row) {
      throw new EntityNotFoundException('InventoryItemCategory', id);
    }
    await this.auditService.record({
      businessId,
      userId: actorUserId,
      entityType: 'inventory_item_category',
      entityId: id,
      action: isActive ? 'ACTIVATE' : 'DEACTIVATE',
    });
    return InventoryItemCategoryMapper.toDomain(row);
  }

  private async getOwnedOrFail(
    businessId: string,
    id: string,
  ): Promise<InventoryItemCategoryRow> {
    const row = await this.categoriesRepository.findById(id, businessId);
    if (!row) {
      throw new EntityNotFoundException('InventoryItemCategory', id);
    }
    return row;
  }
}
