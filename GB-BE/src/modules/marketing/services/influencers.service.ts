import { Inject, Injectable } from '@nestjs/common';
import { EntityNotFoundException } from '../../../common/exceptions';
import { PaginatedResult } from '../../../common/pagination/paginated-result.interface';
import { buildPaginationMeta } from '../../../common/pagination/pagination.util';
import { AuditService } from '../../audit/services/audit.service';
import { Influencer } from '../domain/marketing.interface';
import {
  CreateInfluencerData,
  InfluencerQuery,
  UpdateInfluencerData,
} from '../domain/marketing.types';
import { MarketingMapper } from '../mappers/marketing.mapper';
import { INFLUENCERS_REPOSITORY } from '../repositories/influencers.repository.interface';
import type { IInfluencersRepository } from '../repositories/influencers.repository.interface';

@Injectable()
export class InfluencersService {
  constructor(
    @Inject(INFLUENCERS_REPOSITORY)
    private readonly influencersRepository: IInfluencersRepository,
    private readonly auditService: AuditService,
  ) {}

  async create(
    data: CreateInfluencerData,
    actorUserId?: string,
  ): Promise<Influencer> {
    const row = await this.influencersRepository.create(data);
    await this.auditService.record({
      businessId: data.businessId,
      userId: actorUserId,
      entityType: 'marketing_influencer',
      entityId: row.id,
      action: 'CREATE',
      newValues: { name: row.name },
    });
    return MarketingMapper.influencerToDomain(row);
  }

  async findAll(query: InfluencerQuery): Promise<PaginatedResult<Influencer>> {
    const { rows, total } = await this.influencersRepository.findAll(query);
    return {
      data: rows.map((row) => MarketingMapper.influencerToDomain(row)),
      meta: buildPaginationMeta(query.page, query.limit, total),
    };
  }

  async update(
    businessId: string,
    id: string,
    data: UpdateInfluencerData,
    actorUserId?: string,
  ): Promise<Influencer> {
    const row = await this.influencersRepository.update(id, businessId, data);
    if (!row) {
      throw new EntityNotFoundException('MarketingInfluencer', id);
    }
    await this.auditService.record({
      businessId,
      userId: actorUserId,
      entityType: 'marketing_influencer',
      entityId: id,
      action: 'UPDATE',
      newValues: data as Record<string, unknown>,
    });
    return MarketingMapper.influencerToDomain(row);
  }

  async softDelete(
    businessId: string,
    id: string,
    actorUserId?: string,
  ): Promise<void> {
    const row = await this.influencersRepository.softDelete(id, businessId);
    if (!row) {
      throw new EntityNotFoundException('MarketingInfluencer', id);
    }
    await this.auditService.record({
      businessId,
      userId: actorUserId,
      entityType: 'marketing_influencer',
      entityId: id,
      action: 'DELETE',
    });
  }
}
