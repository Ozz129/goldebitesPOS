import { DbClient } from '../../../database/types/database.types';
import { CouponRow } from '../domain/marketing.interface';
import {
  CouponQuery,
  CreateCouponData,
  UpdateCouponData,
} from '../domain/marketing.types';

export interface ICouponsRepository {
  create(data: CreateCouponData, client?: DbClient): Promise<CouponRow>;
  findById(
    id: string,
    businessId: string,
    client?: DbClient,
  ): Promise<CouponRow | null>;
  findAll(query: CouponQuery): Promise<{ rows: CouponRow[]; total: number }>;
  update(
    id: string,
    businessId: string,
    data: UpdateCouponData,
  ): Promise<CouponRow | null>;
  setActive(
    id: string,
    businessId: string,
    isActive: boolean,
  ): Promise<CouponRow | null>;
  softDelete(id: string, businessId: string): Promise<CouponRow | null>;
}

export const COUPONS_REPOSITORY = Symbol('COUPONS_REPOSITORY');
