import { Inject, Injectable } from '@nestjs/common';
import { EntityNotFoundException } from '../../../common/exceptions';
import { PaginatedResult } from '../../../common/pagination/paginated-result.interface';
import { buildPaginationMeta } from '../../../common/pagination/pagination.util';
import { AuditService } from '../../audit/services/audit.service';
import { Campaign } from '../domain/marketing.interface';
import {
  CampaignQuery,
  CreateCampaignData,
  UpdateCampaignData,
} from '../domain/marketing.types';
import { MarketingMapper } from '../mappers/marketing.mapper';
import { CAMPAIGNS_REPOSITORY } from '../repositories/campaigns.repository.interface';
import type { ICampaignsRepository } from '../repositories/campaigns.repository.interface';

@Injectable()
export class CampaignsService {
  constructor(
    @Inject(CAMPAIGNS_REPOSITORY)
    private readonly campaignsRepository: ICampaignsRepository,
    private readonly auditService: AuditService,
  ) {}

  async create(
    data: CreateCampaignData,
    actorUserId?: string,
  ): Promise<Campaign> {
    const row = await this.campaignsRepository.create(data);
    await this.auditService.record({
      businessId: data.businessId,
      userId: actorUserId,
      entityType: 'marketing_campaign',
      entityId: row.id,
      action: 'CREATE',
      newValues: { name: row.name, channel: row.channel },
    });
    return MarketingMapper.campaignToDomain(row);
  }

  async findAll(query: CampaignQuery): Promise<PaginatedResult<Campaign>> {
    const { rows, total } = await this.campaignsRepository.findAll(query);
    return {
      data: rows.map((row) => MarketingMapper.campaignToDomain(row)),
      meta: buildPaginationMeta(query.page, query.limit, total),
    };
  }

  async update(
    businessId: string,
    id: string,
    data: UpdateCampaignData,
    actorUserId?: string,
  ): Promise<Campaign> {
    const row = await this.campaignsRepository.update(id, businessId, data);
    if (!row) {
      throw new EntityNotFoundException('MarketingCampaign', id);
    }
    await this.auditService.record({
      businessId,
      userId: actorUserId,
      entityType: 'marketing_campaign',
      entityId: id,
      action: 'UPDATE',
      newValues: data as Record<string, unknown>,
    });
    return MarketingMapper.campaignToDomain(row);
  }

  async softDelete(
    businessId: string,
    id: string,
    actorUserId?: string,
  ): Promise<void> {
    const row = await this.campaignsRepository.softDelete(id, businessId);
    if (!row) {
      throw new EntityNotFoundException('MarketingCampaign', id);
    }
    await this.auditService.record({
      businessId,
      userId: actorUserId,
      entityType: 'marketing_campaign',
      entityId: id,
      action: 'DELETE',
    });
  }
}
