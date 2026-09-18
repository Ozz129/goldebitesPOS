import { Inject, Injectable } from '@nestjs/common';
import { BusinessRuleException, EntityNotFoundException } from '../../../common/exceptions';
import { PaginatedResult } from '../../../common/pagination/paginated-result.interface';
import { buildPaginationMeta } from '../../../common/pagination/pagination.util';
import { TransactionService } from '../../../database/transaction.service';
import { AuditService } from '../../audit/services/audit.service';
import { EmployeesService } from '../../employees/services/employees.service';
import { Expense } from '../domain/expense.interface';
import {
  CreateExpenseData,
  ExpenseCategoryTotal,
  ExpensePaymentSource,
  ExpenseQuery,
  ExpenseSummaryQuery,
  UpdateExpenseData,
} from '../domain/expense.types';
import { ExpenseMapper } from '../mappers/expense.mapper';
import { EXPENSES_REPOSITORY } from '../repositories/expenses.repository.interface';
import type { IExpensesRepository } from '../repositories/expenses.repository.interface';
import { ReimbursementsService } from './reimbursements.service';

@Injectable()
export class ExpensesService {
  constructor(
    @Inject(EXPENSES_REPOSITORY)
    private readonly expensesRepository: IExpensesRepository,
    private readonly employeesService: EmployeesService,
    private readonly reimbursementsService: ReimbursementsService,
    private readonly transactionService: TransactionService,
    private readonly auditService: AuditService,
  ) {}

  async create(
    data: CreateExpenseData,
    actorUserId?: string,
  ): Promise<Expense> {
    let payerName = data.payerName;

    if (data.paymentSource === ExpensePaymentSource.PERSONAL_MONEY) {
      if (data.payerEmployeeId) {
        // Server-derived, not client-trusted: the employee's name at the time of the expense.
        const employee = await this.employeesService.findOne(data.businessId, data.payerEmployeeId);
        payerName = `${employee.firstName} ${employee.lastName}`;
      } else if (!data.payerName?.trim()) {
        throw new BusinessRuleException(
          'Personal-money expenses require identifying who paid (an employee or a name)',
          'PAYER_REQUIRED',
        );
      }
    }

    const row = await this.transactionService.execute(async (client) => {
      const created = await this.expensesRepository.create({ ...data, payerName }, client);

      if (data.paymentSource === ExpensePaymentSource.PERSONAL_MONEY) {
        await this.reimbursementsService.createForExpense(
          {
            businessId: data.businessId,
            expenseId: created.id,
            payerEmployeeId: data.payerEmployeeId,
            payerName: payerName as string,
            originalAmount: data.amount,
          },
          client,
        );
      }

      return created;
    });

    await this.auditService.record({
      businessId: data.businessId,
      branchId: data.branchId,
      userId: actorUserId,
      entityType: 'expense',
      entityId: row.id,
      action: 'CREATE',
      newValues: { category: row.category, amount: row.amount, paymentSource: row.payment_source },
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
