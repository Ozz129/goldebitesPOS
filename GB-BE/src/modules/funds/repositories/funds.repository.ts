import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../../database/database.service';
import { DbClient } from '../../../database/types/database.types';
import { FundMovementRow, FundRow } from '../domain/fund.interface';
import { FundType } from '../domain/fund.types';
import { IFundsRepository, InsertFundMovementData } from './funds.repository.interface';

const FUND_COLUMNS = `id, business_id, branch_id, fund_type, initialized_at, initialized_by, initialization_notes, created_at, updated_at`;
const MOVEMENT_COLUMNS = `id, fund_id, direction, amount::text AS amount, balance_before::text AS balance_before, balance_after::text AS balance_after, source_type, source_id, notes, created_by, created_at`;

@Injectable()
export class FundsRepository implements IFundsRepository {
  constructor(private readonly db: DatabaseService) {}

  async getOrCreateFundForUpdate(
    businessId: string,
    branchId: string | null,
    fundType: FundType,
    client: DbClient,
  ): Promise<FundRow> {
    await this.db.query(
      `INSERT INTO funds (business_id, branch_id, fund_type)
       VALUES ($1, $2, $3)
       ON CONFLICT (business_id, branch_id, fund_type) DO NOTHING`,
      [businessId, branchId, fundType],
      client,
    );
    const result = await this.db.query<FundRow>(
      `SELECT ${FUND_COLUMNS} FROM funds
       WHERE business_id = $1 AND branch_id IS NOT DISTINCT FROM $2 AND fund_type = $3
       FOR UPDATE`,
      [businessId, branchId, fundType],
      client,
    );
    return result.rows[0];
  }

  async findFund(
    businessId: string,
    branchId: string | null,
    fundType: FundType,
  ): Promise<FundRow | null> {
    const result = await this.db.query<FundRow>(
      `SELECT ${FUND_COLUMNS} FROM funds
       WHERE business_id = $1 AND branch_id IS NOT DISTINCT FROM $2 AND fund_type = $3`,
      [businessId, branchId, fundType],
    );
    return result.rows[0] ?? null;
  }

  async markInitialized(
    fundId: string,
    initializedBy: string,
    notes: string,
    client: DbClient,
  ): Promise<void> {
    await this.db.query(
      `UPDATE funds SET initialized_at = now(), initialized_by = $2, initialization_notes = $3
       WHERE id = $1`,
      [fundId, initializedBy, notes],
      client,
    );
  }

  async findLatestMovement(
    fundId: string,
    client?: DbClient,
  ): Promise<FundMovementRow | null> {
    const result = await this.db.query<FundMovementRow>(
      `SELECT ${MOVEMENT_COLUMNS} FROM fund_movements
       WHERE fund_id = $1
       ORDER BY created_at DESC, id DESC
       LIMIT 1`,
      [fundId],
      client,
    );
    return result.rows[0] ?? null;
  }

  async findMovementBySource(
    fundId: string,
    sourceType: string,
    sourceId: string,
    client: DbClient,
  ): Promise<FundMovementRow | null> {
    const result = await this.db.query<FundMovementRow>(
      `SELECT ${MOVEMENT_COLUMNS} FROM fund_movements
       WHERE fund_id = $1 AND source_type = $2 AND source_id = $3`,
      [fundId, sourceType, sourceId],
      client,
    );
    return result.rows[0] ?? null;
  }

  async insertMovement(
    data: InsertFundMovementData,
    client: DbClient,
  ): Promise<FundMovementRow> {
    const result = await this.db.query<FundMovementRow>(
      `INSERT INTO fund_movements (fund_id, direction, amount, balance_before, balance_after, source_type, source_id, notes, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING ${MOVEMENT_COLUMNS}`,
      [
        data.fundId,
        data.direction,
        data.amount,
        data.balanceBefore,
        data.balanceAfter,
        data.sourceType,
        data.sourceId ?? null,
        data.notes ?? null,
        data.createdBy ?? null,
      ],
      client,
    );
    return result.rows[0];
  }
}
