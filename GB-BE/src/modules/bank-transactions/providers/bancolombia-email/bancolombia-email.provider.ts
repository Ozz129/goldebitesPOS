import { Inject, Injectable, Logger } from '@nestjs/common';
import { BankTransactionSource, NormalizedBankTransaction } from '../../domain/bank-transaction.types';
import { BankTransactionProvider } from '../bank-transaction-provider.interface';
import { BancolombiaNotificationParser } from './bancolombia-notification.parser';
import { EMAIL_PROVIDER } from './email-provider.interface';
import type { EmailProvider } from './email-provider.interface';

/**
 * Pipeline: EmailProvider -> BancolombiaNotificationParser -> NormalizedBankTransaction.
 * If Bancolombia changes their email format, only BancolombiaNotificationParser changes.
 * If the mailbox moves off Gmail, only the EmailProvider implementation changes. Neither
 * change touches BankTransactionIngestionService or PaymentMatchingService.
 */
@Injectable()
export class BancolombiaEmailProvider implements BankTransactionProvider {
  private readonly logger = new Logger(BancolombiaEmailProvider.name);

  constructor(
    @Inject(EMAIL_PROVIDER) private readonly emailProvider: EmailProvider,
    private readonly parser: BancolombiaNotificationParser,
  ) {}

  async fetchNewTransactions(since: Date): Promise<NormalizedBankTransaction[]> {
    const messages = await this.emailProvider.listMessagesSince(since);
    const transactions: NormalizedBankTransaction[] = [];

    for (const message of messages) {
      const parsed = this.parser.parse(message);
      if (!parsed) continue;

      transactions.push({
        externalId: message.id,
        amount: parsed.amount,
        receivedAt: parsed.receivedAt,
        reference: parsed.reference,
        source: BankTransactionSource.BANCOLOMBIA_EMAIL,
        rawMetadata: {
          subject: message.subject,
          fromAddress: message.fromAddress,
          authenticationResults: message.authenticationResults ?? null,
        },
      });
    }

    this.logger.debug(`Parsed ${transactions.length} of ${messages.length} emails into bank transactions`);
    return transactions;
  }
}
