import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppConfig } from '../../../../config/app.config';
import { RawEmailMessage } from './email-provider.interface';

export interface ParsedBancolombiaNotification {
  amount: number;
  reference: string | null;
  receivedAt: Date;
}

/**
 * Decoupled from Gmail on purpose: EmailProvider hands this a normalized RawEmailMessage,
 * this hands PaymentMatchingService a normalized ParsedBancolombiaNotification. If
 * Bancolombia changes their email format, only this file (and its fixture) needs to change.
 *
 * IMPORTANT — the extraction rules below are a provisional best guess (common Colombian
 * peso formatting: "$38.500", dot as thousands separator) calibrated only against the
 * FICTIONAL fixture in ./fixtures/sample-notification.fixture.ts. They have not been
 * checked against a real Bancolombia notification. Recalibrate extractAmount/extractReference
 * once a real, anonymized sample is available — the sender/subject filtering above them is
 * independent and does not need to change.
 */
@Injectable()
export class BancolombiaNotificationParser {
  private readonly logger = new Logger(BancolombiaNotificationParser.name);

  constructor(private readonly configService: ConfigService) {}

  private get config(): AppConfig['bankVerification'] {
    return this.configService.getOrThrow<AppConfig>('app').bankVerification;
  }

  parse(email: RawEmailMessage): ParsedBancolombiaNotification | null {
    if (!this.isFromAllowedSender(email)) {
      this.logger.warn(`Ignoring email ${email.id}: sender "${email.fromAddress}" is not allowlisted`);
      return null;
    }
    if (!this.matchesSubjectFilter(email)) {
      this.logger.debug(`Ignoring email ${email.id}: subject "${email.subject}" does not match the filter`);
      return null;
    }

    const amount = this.extractAmount(email.bodyText);
    if (amount === null) {
      this.logger.warn(`Email ${email.id} passed sender/subject filters but no amount could be extracted`);
      return null;
    }

    return {
      amount,
      reference: this.extractReference(email.bodyText),
      receivedAt: email.receivedAt,
    };
  }

  private isFromAllowedSender(email: RawEmailMessage): boolean {
    const allowlist = this.config.senderAllowlist;
    if (allowlist.length === 0) return true;
    return allowlist.some((allowed) => email.fromAddress.toLowerCase() === allowed.toLowerCase());
  }

  private matchesSubjectFilter(email: RawEmailMessage): boolean {
    const filter = this.config.subjectFilter;
    if (!filter) return true;
    return email.subject.toLowerCase().includes(filter.toLowerCase());
  }

  /** Matches "$38.500" / "$ 38.500,00" style Colombian peso amounts — provisional, see class docblock. */
  private extractAmount(bodyText: string): number | null {
    const match = bodyText.match(/\$\s?([\d.,]+)/);
    if (!match) return null;
    const normalized = match[1].replace(/\./g, '').replace(',', '.');
    const value = parseFloat(normalized);
    return Number.isFinite(value) && value > 0 ? value : null;
  }

  /** Matches "Comprobante No. 123456789" / "Referencia: ABC123" style mentions — provisional, see class docblock. */
  private extractReference(bodyText: string): string | null {
    const match = bodyText.match(/(?:comprobante|aprobaci[oó]n|referencia)\s*(?:n[uú]mero|no\.?|nro\.?)?\s*[:#]?\s*(\w+)/i);
    return match ? match[1] : null;
  }
}
