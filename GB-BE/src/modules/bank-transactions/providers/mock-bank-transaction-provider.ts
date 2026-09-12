import { Injectable, Logger } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { BankTransactionSource, NormalizedBankTransaction } from '../domain/bank-transaction.types';
import { BankTransactionProvider } from './bank-transaction-provider.interface';

export interface SimulateTransactionInput {
  amount: number;
  reference?: string;
  receivedAt?: Date;
  externalId?: string;
}

/**
 * Dev-only provider that lets you simulate a bank movement without a real Bancolombia
 * email. Queued transactions flow through the exact same ingestion/matching pipeline as
 * any other provider — only where they come from differs. Never wired up in production;
 * see BankTransactionsModule, which refuses to register this provider when NODE_ENV is
 * 'production', even if BANK_VERIFICATION_PROVIDER is accidentally left as 'mock'.
 */
@Injectable()
export class MockBankTransactionProvider implements BankTransactionProvider {
  private readonly logger = new Logger(MockBankTransactionProvider.name);
  private readonly queued: NormalizedBankTransaction[] = [];

  simulate(input: SimulateTransactionInput): NormalizedBankTransaction {
    const transaction: NormalizedBankTransaction = {
      externalId: input.externalId ?? `mock-${randomUUID()}`,
      amount: input.amount,
      receivedAt: input.receivedAt ?? new Date(),
      reference: input.reference ?? null,
      source: BankTransactionSource.MOCK,
      rawMetadata: { simulated: true },
    };
    this.queued.push(transaction);
    this.logger.debug(`Simulated bank transaction ${transaction.externalId} for ${transaction.amount}`);
    return transaction;
  }

  async fetchNewTransactions(since: Date): Promise<NormalizedBankTransaction[]> {
    return this.queued.filter((transaction) => transaction.receivedAt > since);
  }
}
