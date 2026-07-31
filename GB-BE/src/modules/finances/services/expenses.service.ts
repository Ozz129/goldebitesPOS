import { Inject, Injectable } from '@nestjs/common';
import { EntityNotFoundException } from '../../../common/exceptions';
import { PaginatedResult } from '../../../common/pagination/paginated-result.interface';
import { buildPaginationMeta } from '../../../common/pagination/pagination.util';
import { AuditService } from '../../audit/services/audit.service';
import { Expense } from '../domain/expense.interface';
import {
  CreateExpenseData,
  ExpenseCategoryTotal,
  ExpenseQuery,
  ExpenseSummaryQuery,
  UpdateExpenseData,
} from '../domain/expense.types';
import { ExpenseMapper } from '../mappers/expense.mapper';
import { EXPENSES_REPOSITORY } from '../repositories/expenses.repository.interface';
import type { IExpensesRepository } from '../repositories/expenses.repository.interface';

@Injectable()
export class ExpensesService {
  constructor(
    @Inject(EXPENSES_REPOSITORY)
    private readonly expensesRepository: IExpensesRepository,
    private readonly auditService: AuditService,
  ) {}

  async create(
    data: CreateExpenseData,
    actorUserId?: string,
  ): Promise<Expense> {
    const row = await this.expensesRepository.create(data);
    await this.auditService.record({
      businessId: data.businessId,
      branchId: data.branchId,
      userId: actorUserId,
      entityType: 'expense',
      entityId: row.id,
      action: 'CREATE',
      newValues: { category: row.category, amount: row.amount },
    });
    return ExpenseMapper.toDomain(row);
  }

  async findAll(query: ExpenseQuery): Promise<PaginatedResult<Expense>> {
    const { rows, total } = await this.expensesRepository.findAll(query);
    return {
      data: rows.map((row) => ExpenseMapper.toDomain(row)),
      meta: buildPaginationMeta(query.page, query.limit, total),
    };
  }

  async update(
    businessId: string,
    id: string,
    data: UpdateExpenseData,
    actorUserId?: string,
  ): Promise<Expense> {
    const row = await this.expensesRepository.update(id, businessId, data);
    if (!row) {
      throw new EntityNotFoundException('Expense', id);
    }
    await this.auditService.record({
      businessId,
      userId: actorUserId,
      entityType: 'expense',
      entityId: id,
      action: 'UPDATE',
      newValues: data as Record<string, unknown>,
    });
    return ExpenseMapper.toDomain(row);
  }

  async softDelete(
    businessId: string,
    id: string,
    actorUserId?: string,
  ): Promise<void> {
    const row = await this.expensesRepository.softDelete(id, businessId);
    if (!row) {
      throw new EntityNotFoundException('Expense', id);
    }
    await this.auditService.record({
      businessId,
      userId: actorUserId,
      entityType: 'expense',
      entityId: id,
      action: 'DELETE',
    });
  }

  async getSummaryByCategory(
    query: ExpenseSummaryQuery,
  ): Promise<ExpenseCategoryTotal[]> {
    const rows = await this.expensesRepository.getSummaryByCategory(query);
    return rows.map((row) => ExpenseMapper.categoryTotalToDomain(row));
  }
}
