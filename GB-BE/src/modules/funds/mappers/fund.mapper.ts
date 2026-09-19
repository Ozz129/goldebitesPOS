import { Fund, FundMovement, FundMovementRow, FundRow } from '../domain/fund.interface';

export class FundMapper {
  static toDomain(row: FundRow): Fund {
    return {
      id: row.id,
      businessId: row.business_id,
      branchId: row.branch_id,
      fundType: row.fund_type,
      initializedAt: row.initialized_at,
      initializedBy: row.initialized_by,
      initializationNotes: row.initialization_notes,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }
}

export class FundMovementMapper {
  static toDomain(row: FundMovementRow): FundMovement {
    return {
      id: row.id,
      fundId: row.fund_id,
      direction: row.direction,
      amount: parseFloat(row.amount),
      balanceBefore: parseFloat(row.balance_before),
      balanceAfter: parseFloat(row.balance_after),
      sourceType: row.source_type,
      sourceId: row.source_id,
      notes: row.notes,
      createdBy: row.created_by,
      createdAt: row.created_at,
    };
  }
}
