import { Inject, Injectable } from '@nestjs/common';
import {
  BusinessRuleException,
  EntityNotFoundException,
} from '../../../common/exceptions';
import { TransactionService } from '../../../database/transaction.service';
import { AuditService } from '../../audit/services/audit.service';
import {
  CashMovementType,
  PaymentMethod,
} from '../../cash-sessions/domain/cash-session.interface';
import { CashSessionsService } from '../../cash-sessions/services/cash-sessions.service';
import {
  OrderPaymentStatus,
  OrderStatus,
} from '../../orders/domain/order.interface';
import { OrdersService } from '../../orders/services/orders.service';
import { Payment } from '../domain/payment.interface';
import { CreatePaymentData, UpdatePaymentMethodData } from '../domain/payment.types';
import { PaymentMapper } from '../mappers/payment.mapper';
import { PAYMENTS_REPOSITORY } from '../repositories/payments.repository.interface';
import type { IPaymentsRepository } from '../repositories/payments.repository.interface';

@Injectable()
export class PaymentsService {
  constructor(
    @Inject(PAYMENTS_REPOSITORY)
    private readonly paymentsRepository: IPaymentsRepository,
    private readonly ordersService: OrdersService,
    private readonly cashSessionsService: CashSessionsService,
    private readonly transactionService: TransactionService,
    private readonly auditService: AuditService,
  ) {}

  async create(
    businessId: string,
    data: CreatePaymentData,
    actorUserId?: string,
  ): Promise<Payment> {
    const order = await this.ordersService.getOwnedOrFail(
      businessId,
      data.orderId,
    );
    if (order.status === OrderStatus.CANCELLED) {
      throw new BusinessRuleException(
        'Cannot register a payment for a cancelled order',
        'ORDER_CANCELLED',
      );
    }

    const alreadyPaid = await this.paymentsRepository.getTotalPaid(
      data.orderId,
    );
    const totalAmount = parseFloat(order.total_amount);
    const newTotal = round2(alreadyPaid + data.amount);
    if (newTotal > totalAmount) {
      throw new BusinessRuleException(
        `Payment of ${data.amount} would exceed the order total (paid ${alreadyPaid} of ${totalAmount})`,
        'PAYMENT_EXCEEDS_ORDER_TOTAL',
      );
    }

    const cashSessionId =
      data.paymentMethod === PaymentMethod.CASH
        ? (
            await this.cashSessionsService.getOpenSessionOrFail(
              businessId,
              order.branch_id,
            )
          ).id
        : await this.cashSessionsService.findOpenSessionId(
            businessId,
            order.branch_id,
          );

    const row = await this.transactionService.execute(async (client) => {
      const created = await this.paymentsRepository.create(
        data,
        actorUserId,
        client,
      );

      if (cashSessionId) {
        await this.cashSessionsService.recordSaleMovement(
          {
            cashSessionId,
            orderId: order.id,
            paymentId: created.id,
            movementType: CashMovementType.SALE,
            paymentMethod: data.paymentMethod,
            amount: data.amount,
            createdBy: actorUserId,
          },
          client,
        );
      }

      const paymentStatus =
        newTotal >= totalAmount
          ? OrderPaymentStatus.PAID
          : OrderPaymentStatus.PARTIALLY_PAID;
      await this.ordersService.syncPaymentStatus(
        order.id,
        paymentStatus,
        client,
      );

      return created;
    });

    await this.auditService.record({
      businessId,
      branchId: order.branch_id,
      userId: actorUserId,
      entityType: 'payment',
      entityId: row.id,
      action: 'CREATE',
      newValues: {
        orderId: data.orderId,
        paymentMethod: data.paymentMethod,
        amount: data.amount,
      },
    });

    return PaymentMapper.toDomain(row);
  }

  /** Corrects a misrecorded payment method (e.g. marked "transferencia" but was actually cash). */
  async updateMethod(
    businessId: string,
    orderId: string,
    paymentId: string,
    data: UpdatePaymentMethodData,
    actorUserId?: string,
  ): Promise<Payment> {
    const order = await this.ordersService.getOwnedOrFail(businessId, orderId);
    const existing = await this.paymentsRepository.findById(paymentId);
    if (!existing || existing.order_id !== orderId) {
      throw new EntityNotFoundException('Payment', paymentId);
    }
    const previousMethod = existing.payment_method;

    const updated = await this.transactionService.execute(async (client) => {
      const row = await this.paymentsRepository.updateMethod(
        paymentId,
        data.paymentMethod,
        data.reference,
        client,
      );
      if (!row) {
        throw new EntityNotFoundException('Payment', paymentId);
      }
      if (previousMethod !== data.paymentMethod) {
        await this.cashSessionsService.correctSaleMovementMethod(
          paymentId,
          data.paymentMethod,
          client,
        );
      }
      return row;
    });

    await this.auditService.record({
      businessId,
      branchId: order.branch_id,
      userId: actorUserId,
      entityType: 'payment',
      entityId: paymentId,
      action: 'UPDATE_METHOD',
      oldValues: { paymentMethod: previousMethod },
      newValues: { paymentMethod: data.paymentMethod },
    });

    return PaymentMapper.toDomain(updated);
  }

  async findByOrder(businessId: string, orderId: string): Promise<Payment[]> {
    await this.ordersService.getOwnedOrFail(businessId, orderId);
    const rows = await this.paymentsRepository.findByOrder(orderId);
    return rows.map((row) => PaymentMapper.toDomain(row));
  }
}

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}
