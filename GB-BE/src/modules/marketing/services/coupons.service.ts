import { Inject, Injectable } from '@nestjs/common';
import { EntityNotFoundException } from '../../../common/exceptions';
import { PaginatedResult } from '../../../common/pagination/paginated-result.interface';
import { buildPaginationMeta } from '../../../common/pagination/pagination.util';
import { AuditService } from '../../audit/services/audit.service';
import { Coupon } from '../domain/marketing.interface';
import {
  CouponQuery,
  CreateCouponData,
  UpdateCouponData,
} from '../domain/marketing.types';
import { MarketingMapper } from '../mappers/marketing.mapper';
import { COUPONS_REPOSITORY } from '../repositories/coupons.repository.interface';
import type { ICouponsRepository } from '../repositories/coupons.repository.interface';

@Injectable()
export class CouponsService {
  constructor(
    @Inject(COUPONS_REPOSITORY)
    private readonly couponsRepository: ICouponsRepository,
    private readonly auditService: AuditService,
  ) {}

  async create(data: CreateCouponData, actorUserId?: string): Promise<Coupon> {
    const row = await this.couponsRepository.create(data);
    await this.auditService.record({
      businessId: data.businessId,
      userId: actorUserId,
      entityType: 'marketing_coupon',
      entityId: row.id,
      action: 'CREATE',
      newValues: { code: row.code },
    });
    return MarketingMapper.couponToDomain(row);
  }

  async findAll(query: CouponQuery): Promise<PaginatedResult<Coupon>> {
    const { rows, total } = await this.couponsRepository.findAll(query);
    return {
      data: rows.map((row) => MarketingMapper.couponToDomain(row)),
      meta: buildPaginationMeta(query.page, query.limit, total),
    };
  }

  async update(
    businessId: string,
    id: string,
    data: UpdateCouponData,
    actorUserId?: string,
  ): Promise<Coupon> {
    const row = await this.couponsRepository.update(id, businessId, data);
    if (!row) {
      throw new EntityNotFoundException('MarketingCoupon', id);
    }
    await this.auditService.record({
      businessId,
      userId: actorUserId,
      entityType: 'marketing_coupon',
      entityId: id,
      action: 'UPDATE',
      newValues: data as Record<string, unknown>,
    });
    return MarketingMapper.couponToDomain(row);
  }

  async setActive(
    businessId: string,
    id: string,
    isActive: boolean,
    actorUserId?: string,
  ): Promise<Coupon> {
    const row = await this.couponsRepository.setActive(
      id,
      businessId,
      isActive,
    );
    if (!row) {
      throw new EntityNotFoundException('MarketingCoupon', id);
    }
    await this.auditService.record({
      businessId,
      userId: actorUserId,
      entityType: 'marketing_coupon',
      entityId: id,
      action: isActive ? 'ACTIVATE' : 'DEACTIVATE',
    });
    return MarketingMapper.couponToDomain(row);
  }

  async softDelete(
    businessId: string,
    id: string,
    actorUserId?: string,
  ): Promise<void> {
    const row = await this.couponsRepository.softDelete(id, businessId);
    if (!row) {
      throw new EntityNotFoundException('MarketingCoupon', id);
    }
    await this.auditService.record({
      businessId,
      userId: actorUserId,
      entityType: 'marketing_coupon',
      entityId: id,
      action: 'DELETE',
    });
  }
}
