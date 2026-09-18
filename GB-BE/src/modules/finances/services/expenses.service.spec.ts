import { BusinessRuleException, EntityNotFoundException } from '../../../common/exceptions';
import { ExpenseRow } from '../domain/expense.interface';
import { ExpenseCategory, ExpensePaymentSource } from '../domain/expense.types';
import { ExpensesService } from './expenses.service';

describe('ExpensesService', () => {
  let expensesRepository: { create: jest.Mock };
  let employeesService: { findOne: jest.Mock };
  let reimbursementsService: { createForExpense: jest.Mock };
  let transactionService: { execute: jest.Mock };
  let auditService: { record: jest.Mock };
  let service: ExpensesService;

  const businessId = 'business-1';

  function makeExpenseRow(overrides: Partial<ExpenseRow> = {}): ExpenseRow {
    return {
      id: 'expense-1',
      business_id: businessId,
      branch_id: null,
      category: ExpenseCategory.OPERATING,
      name: 'Aseo',
      description: 'Productos de limpieza',
      responsible: 'Ana',
      amount: '50000.00',
      expense_date: '2026-09-18',
      payment_source: ExpensePaymentSource.BUSINESS_FUNDS,
      payer_employee_id: null,
      payer_name: null,
      created_at: new Date(),
      updated_at: new Date(),
      deleted_at: null,
      ...overrides,
    };
  }

  beforeEach(() => {
    expensesRepository = { create: jest.fn() };
    employeesService = { findOne: jest.fn() };
    reimbursementsService = { createForExpense: jest.fn() };
    transactionService = {
      execute: jest.fn((work: (client: unknown) => Promise<unknown>) => work({})),
    };
    auditService = { record: jest.fn() };
    service = new ExpensesService(
      expensesRepository as never,
      employeesService as never,
      reimbursementsService as never,
      transactionService as never,
      auditService as never,
    );
  });

  describe('create — BUSINESS_FUNDS (default)', () => {
    it('creates the expense without touching employees or reimbursements', async () => {
      expensesRepository.create.mockResolvedValue(makeExpenseRow());

      await service.create({
        businessId,
        category: ExpenseCategory.OPERATING,
        name: 'Aseo',
        description: 'Productos de limpieza',
        responsible: 'Ana',
        amount: 50000,
        expenseDate: '2026-09-18',
        paymentSource: ExpensePaymentSource.BUSINESS_FUNDS,
      });

      expect(employeesService.findOne).not.toHaveBeenCalled();
      expect(reimbursementsService.createForExpense).not.toHaveBeenCalled();
      expect(expensesRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({ paymentSource: ExpensePaymentSource.BUSINESS_FUNDS }),
        expect.anything(),
      );
    });
  });

  describe('create — PERSONAL_MONEY', () => {
    it('rejects when neither payerEmployeeId nor payerName is provided', async () => {
      await expect(
        service.create({
          businessId,
          category: ExpenseCategory.OPERATING,
          name: 'Aseo',
          description: 'Productos de limpieza',
          responsible: 'Ana',
          amount: 50000,
          expenseDate: '2026-09-18',
          paymentSource: ExpensePaymentSource.PERSONAL_MONEY,
        }),
      ).rejects.toThrow(BusinessRuleException);
      expect(expensesRepository.create).not.toHaveBeenCalled();
    });

    it('creates the expense and an obligation atomically, using a free-text payer name', async () => {
      expensesRepository.create.mockResolvedValue(
        makeExpenseRow({ payment_source: ExpensePaymentSource.PERSONAL_MONEY, payer_name: 'Carlos (socio)' }),
      );

      await service.create({
        businessId,
        category: ExpenseCategory.OPERATING,
        name: 'Aseo',
        description: 'Productos de limpieza',
        responsible: 'Ana',
        amount: 50000,
        expenseDate: '2026-09-18',
        paymentSource: ExpensePaymentSource.PERSONAL_MONEY,
        payerName: 'Carlos (socio)',
      });

      expect(employeesService.findOne).not.toHaveBeenCalled();
      expect(reimbursementsService.createForExpense).toHaveBeenCalledWith(
        expect.objectContaining({
          businessId,
          expenseId: 'expense-1',
          payerName: 'Carlos (socio)',
          originalAmount: 50000,
        }),
        expect.anything(),
      );
    });

    it('derives the payer name from the linked employee server-side, ignoring any client-supplied payerName', async () => {
      employeesService.findOne.mockResolvedValue({ firstName: 'Ada', lastName: 'Lovelace' });
      expensesRepository.create.mockResolvedValue(
        makeExpenseRow({ payment_source: ExpensePaymentSource.PERSONAL_MONEY, payer_employee_id: 'emp-1' }),
      );

      await service.create({
        businessId,
        category: ExpenseCategory.OPERATING,
        name: 'Aseo',
        description: 'Productos de limpieza',
        responsible: 'Ana',
        amount: 50000,
        expenseDate: '2026-09-18',
        paymentSource: ExpensePaymentSource.PERSONAL_MONEY,
        payerEmployeeId: 'emp-1',
        payerName: 'nombre que el cliente mandó y no debería usarse',
      });

      expect(employeesService.findOne).toHaveBeenCalledWith(businessId, 'emp-1');
      expect(reimbursementsService.createForExpense).toHaveBeenCalledWith(
        expect.objectContaining({ payerEmployeeId: 'emp-1', payerName: 'Ada Lovelace' }),
        expect.anything(),
      );
    });

    it('propagates EntityNotFoundException when payerEmployeeId does not exist, creating nothing', async () => {
      employeesService.findOne.mockRejectedValue(new EntityNotFoundException('Employee', 'emp-bogus'));

      await expect(
        service.create({
          businessId,
          category: ExpenseCategory.OPERATING,
          name: 'Aseo',
          description: 'Productos de limpieza',
          responsible: 'Ana',
          amount: 50000,
          expenseDate: '2026-09-18',
          paymentSource: ExpensePaymentSource.PERSONAL_MONEY,
          payerEmployeeId: 'emp-bogus',
        }),
      ).rejects.toThrow(EntityNotFoundException);
      expect(expensesRepository.create).not.toHaveBeenCalled();
    });
  });
});
