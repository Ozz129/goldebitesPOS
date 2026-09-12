import { BankTransaction, BankTransactionRow, BankTransferRequest, BankTransferRequestRow } from '../domain/bank-transaction.types';

export class BankTransactionMapper {
  static toDomain(row: BankTransactionRow): BankTransaction {
    return {
      id: row.id,
      source: row.source,
      externalId: row.external_id,
      amount: parseFloat(row.amount),
      receivedAt: row.received_at,
      reference: row.reference,
      status: row.status,
      matchedOrderId: row.matched_order_id,
      rawMetadata: row.raw_metadata,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }
}

export class BankTransferRequestMapper {
  static toDomain(row: BankTransferRequestRow): BankTransferRequest {
    return {
      id: row.id,
      businessId: row.business_id,
      orderId: row.order_id,
      amountExpected: parseFloat(row.amount_expected),
      status: row.status,
      matchedTransactionId: row.matched_transaction_id,
      confirmedBy: row.confirmed_by,
      createdBy: row.created_by,
      createdAt: row.created_at,
      resolvedAt: row.resolved_at,
    };
  }
}
