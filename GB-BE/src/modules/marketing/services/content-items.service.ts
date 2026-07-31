import { Inject, Injectable } from '@nestjs/common';
import { EntityNotFoundException } from '../../../common/exceptions';
import { PaginatedResult } from '../../../common/pagination/paginated-result.interface';
import { buildPaginationMeta } from '../../../common/pagination/pagination.util';
import { AuditService } from '../../audit/services/audit.service';
import { ContentItem } from '../domain/marketing.interface';
import {
  ContentItemQuery,
  CreateContentItemData,
  UpdateContentItemData,
} from '../domain/marketing.types';
import { MarketingMapper } from '../mappers/marketing.mapper';
import { CONTENT_ITEMS_REPOSITORY } from '../repositories/content-items.repository.interface';
import type { IContentItemsRepository } from '../repositories/content-items.repository.interface';

@Injectable()
export class ContentItemsService {
  constructor(
    @Inject(CONTENT_ITEMS_REPOSITORY)
    private readonly contentItemsRepository: IContentItemsRepository,
    private readonly auditService: AuditService,
  ) {}

  async create(
    data: CreateContentItemData,
    actorUserId?: string,
  ): Promise<ContentItem> {
    const row = await this.contentItemsRepository.create(data);
    await this.auditService.record({
      businessId: data.businessId,
      userId: actorUserId,
      entityType: 'marketing_content_item',
      entityId: row.id,
      action: 'CREATE',
      newValues: { title: row.title },
    });
    return MarketingMapper.contentItemToDomain(row);
  }

  async findAll(
    query: ContentItemQuery,
  ): Promise<PaginatedResult<ContentItem>> {
    const { rows, total } = await this.contentItemsRepository.findAll(query);
    return {
      data: rows.map((row) => MarketingMapper.contentItemToDomain(row)),
      meta: buildPaginationMeta(query.page, query.limit, total),
    };
  }

  async update(
    businessId: string,
    id: string,
    data: UpdateContentItemData,
    actorUserId?: string,
  ): Promise<ContentItem> {
    const row = await this.contentItemsRepository.update(id, businessId, data);
    if (!row) {
      throw new EntityNotFoundException('MarketingContentItem', id);
    }
    await this.auditService.record({
      businessId,
      userId: actorUserId,
      entityType: 'marketing_content_item',
      entityId: id,
      action: 'UPDATE',
      newValues: data as Record<string, unknown>,
    });
    return MarketingMapper.contentItemToDomain(row);
  }

  async softDelete(
    businessId: string,
    id: string,
    actorUserId?: string,
  ): Promise<void> {
    const row = await this.contentItemsRepository.softDelete(id, businessId);
    if (!row) {
      throw new EntityNotFoundException('MarketingContentItem', id);
    }
    await this.auditService.record({
      businessId,
      userId: actorUserId,
      entityType: 'marketing_content_item',
      entityId: id,
      action: 'DELETE',
    });
  }
}
