import { BusinessRuleException } from '../../../common/exceptions';
import {
  CashMovementType,
  PaymentMethod,
} from '../../cash-sessions/domain/cash-session.interface';
import {
  OrderPaymentStatus,
  OrderStatus,
} from '../../orders/domain/order.interface';
import { PaymentRow } from '../domain/payment.interface';
import { PaymentsService } from './payments.service';

describe('PaymentsService', () => {
  let repository: {
    create: jest.Mock;
    findByOrder: jest.Mock;
    getTotalPaid: jest.Mock;
  };
  let ordersService: {
    getOwnedOrFail: jest.Mock;
    syncPaymentStatus: jest.Mock;
  };
  let cashSessionsService: {
    getOpenSessionOrFail: jest.Mock;
    recordSaleMovement: jest.Mock;
  };
  let transactionService: { execute: jest.Mock };
  let auditService: { record: jest.Mock };
  let service: PaymentsService;

  const businessId = 'business-1';
  const branchId = 'branch-1';

  function makeOrder(overrides: Record<string, unknown> = {}) {
    return {
      id: 'order-1',
      business_id: businessId,
      branch_id: branchId,
      status: OrderStatus.READY,
      total_amount: '10000.00',
      ...overrides,
    };
  }

  function makePaymentRow(overrides: Partial<PaymentRow> = {}): PaymentRow {
    return {
      id: 'payment-1',
      order_id: 'order-1',
      payment_method: PaymentMethod.CASH,
      amount: '10000.00',
      reference: null,
      payer_label: null,
      status: 'PAID',
      paid_at: new Date(),
      created_by: null,
      created_at: new Date(),
      ...overrides,
    };
  }

  beforeEach(() => {
    repository = {
      create: jest.fn(),
      findByOrder: jest.fn().mockResolvedValue([]),
      getTotalPaid: jest.fn().mockResolvedValue(0),
    };
    ordersService = {
      getOwnedOrFail: jest.fn().mockResolvedValue(makeOrder()),
      syncPaymentStatus: jest.fn(),
    };
    cashSessionsService = {
      getOpenSessionOrFail: jest.fn().mockResolvedValue({ id: 'session-1' }),
      recordSaleMovement: jest.fn(),
    };
    transactionService = {
      execute: jest.fn((work: (client: unknown) => Promise<unknown>) =>
        work({}),
      ),
    };
    auditService = { record: jest.fn() };

    service = new PaymentsService(
      repository,
      ordersService as never,
      cashSessionsService as never,
      transactionService as never,
      auditService as never,
    );
  });

  describe('create', () => {
    it('rejects a payment against a cancelled order', async () => {
      ordersService.getOwnedOrFail.mockResolvedValue(
        makeOrder({ status: OrderStatus.CANCELLED }),
      );

      await expect(
        service.create(businessId, {
          orderId: 'order-1',
          paymentMethod: PaymentMethod.CASH,
          amount: 1000,
        }),
      ).rejects.toThrow(BusinessRuleException);
    });

    it('rejects a payment that would exceed the order total', async () => {
      repository.getTotalPaid.mockResolvedValue(8000);

      await expect(
        service.create(businessId, {
          orderId: 'order-1',
          paymentMethod: PaymentMethod.CARD,
          amount: 5000,
        }),
      ).rejects.toThrow(BusinessRuleException);
    });

    it('requires an open cash session for CASH payments', async () => {
      cashSessionsService.getOpenSessionOrFail.mockRejectedValue(
        new Error('closed'),
      );

      await expect(
        service.create(businessId, {
          orderId: 'order-1',
          paymentMethod: PaymentMethod.CASH,
          amount: 10000,
        }),
      ).rejects.toThrow('closed');
      expect(repository.create).not.toHaveBeenCalled();
    });

    it('does not require a cash session for non-cash payment methods', async () => {
      repository.create.mockResolvedValue(
        makePaymentRow({ payment_method: PaymentMethod.CARD }),
      );

      await service.create(businessId, {
        orderId: 'order-1',
        paymentMethod: PaymentMethod.CARD,
        amount: 10000,
      });

      expect(cashSessionsService.getOpenSessionOrFail).not.toHaveBeenCalled();
      expect(cashSessionsService.recordSaleMovement).not.toHaveBeenCalled();
    });

    it('logs a SALE cash movement for CASH payments', async () => {
      repository.create.mockResolvedValue(makePaymentRow());

      await service.create(businessId, {
        orderId: 'order-1',
        paymentMethod: PaymentMethod.CASH,
        amount: 10000,
      });

      expect(cashSessionsService.recordSaleMovement).toHaveBeenCalledWith(
        expect.objectContaining({
          cashSessionId: 'session-1',
          movementType: CashMovementType.SALE,
          paymentMethod: PaymentMethod.CASH,
          amount: 10000,
        }),
        expect.anything(),
      );
    });

    it('marks the order PAID once payments cover the full total', async () => {
      repository.create.mockResolvedValue(makePaymentRow());

      await service.create(businessId, {
        orderId: 'order-1',
        paymentMethod: PaymentMethod.CASH,
        amount: 10000,
      });

      expect(ordersService.syncPaymentStatus).toHaveBeenCalledWith(
        'order-1',
        OrderPaymentStatus.PAID,
        expect.anything(),
      );
    });

    it('marks the order PARTIALLY_PAID when the payment does not cover the full total', async () => {
      repository.create.mockResolvedValue(
        makePaymentRow({ amount: '4000.00' }),
      );

      await service.create(businessId, {
        orderId: 'order-1',
        paymentMethod: PaymentMethod.CARD,
        amount: 4000,
      });

      expect(ordersService.syncPaymentStatus).toHaveBeenCalledWith(
        'order-1',
        OrderPaymentStatus.PARTIALLY_PAID,
        expect.anything(),
      );
    });
  });
});
