import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../../database/database.service';
import { DbClient } from '../../../database/types/database.types';
import { BranchRuleRow } from '../domain/branch-rule.interface';
import { BranchRuleInput } from '../domain/branch-rule.types';
import { IBranchRulesRepository } from './branch-rules.repository.interface';

const SELECT_COLUMNS = `id, business_id, branch_id, title, description, display_order, created_at, updated_at`;

@Injectable()
export class BranchRulesRepository implements IBranchRulesRepository {
  constructor(private readonly db: DatabaseService) {}

  async findAllByBranch(businessId: string, branchId: string): Promise<BranchRuleRow[]> {
    const result = await this.db.query<BranchRuleRow>(
      `SELECT ${SELECT_COLUMNS} FROM branch_rules
       WHERE business_id = $1 AND branch_id = $2
       ORDER BY display_order`,
      [businessId, branchId],
    );
    return result.rows;
  }

  async replaceAll(
    businessId: string,
    branchId: string,
    items: BranchRuleInput[],
    client?: DbClient,
  ): Promise<BranchRuleRow[]> {
    await this.db.query(
      `DELETE FROM branch_rules WHERE business_id = $1 AND branch_id = $2`,
      [businessId, branchId],
      client,
    );

    const inserted: BranchRuleRow[] = [];
    for (const [index, item] of items.entries()) {
      const result = await this.db.query<BranchRuleRow>(
        `INSERT INTO branch_rules (business_id, branch_id, title, description, display_order)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING ${SELECT_COLUMNS}`,
        [businessId, branchId, item.title, item.description ?? null, index],
        client,
      );
      inserted.push(result.rows[0]);
    }
    return inserted;
  }
}
