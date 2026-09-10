import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createHash, randomUUID } from 'node:crypto';
import { BusinessRuleException } from '../../../common/exceptions';
import { AppConfig } from '../../../config/app.config';
import { PaymentMethod } from '../../cash-sessions/domain/cash-session.interface';
import { Payment } from '../../payments/domain/payment.interface';
import { PaymentsService } from '../../payments/services/payments.service';
import { OrdersService } from '../../orders/services/orders.service';
import {
  WompiIntentRow,
  WompiCheckoutParams,
  WompiQrCheckout,
  WompiTransactionResponse,
} from '../domain/wompi.types';
import { WOMPI_INTENTS_REPOSITORY } from '../repositories/wompi-intents.repository.interface';
import type { IWompiIntentsRepository } from '../repositories/wompi-intents.repository.interface';

export interface WompiConfirmResult {
  intent: WompiIntentRow;
  payment: Payment | null;
}

/** Maps Wompi's payment_method_type to our own PaymentMethod enum, for the resulting Payment record. */
const WOMPI_METHOD_MAP: Record<string, PaymentMethod> = {
  CARD: PaymentMethod.CARD,
  NEQUI: PaymentMethod.NEQUI,
  PSE: PaymentMethod.TRANSFER,
  BANCOLOMBIA_TRANSFER: PaymentMethod.TRANSFER,
  BANCOLOMBIA_QR: PaymentMethod.TRANSFER,
  DAVIPLATA: PaymentMethod.DAVIPLATA,
};

@Injectable()
export class WompiService {
  constructor(
    @Inject(WOMPI_INTENTS_REPOSITORY)
    private readonly intentsRepository: IWompiIntentsRepository,
    private readonly ordersService: OrdersService,
    private readonly paymentsService: PaymentsService,
    private readonly configService: ConfigService,
  ) {}

  private get config(): AppConfig['wompi'] {
    return this.configService.getOrThrow<AppConfig>('app').wompi;
  }

  isEnabled(): boolean {
    return this.config.enabled;
  }

  async createIntent(
    businessId: string,
    orderId: string,
    payerLabel: string | undefined,
    actorUserId: string | undefined,
  ): Promise<WompiCheckoutParams> {
    const { reference, amountInCents } = await this.openIntent(
      businessId,
      orderId,
      payerLabel,
      actorUserId,
    );

    return {
      publicKey: this.config.publicKey,
      reference,
      amountInCents,
      currency: 'COP',
      signature: this.computeIntegritySignature(reference, amountInCents),
    };
  }

  /**
   * Creates a BANCOLOMBIA_QR transaction directly against Wompi's API (no widget) and returns
   * the scannable QR — the customer pays from their own Bancolombia/Nequi app, no card/PSE form
   * needed on our side. Confirmation still goes through confirmTransaction() like the widget flow.
   */
  async createQrCheckout(
    businessId: string,
    orderId: string,
    payerLabel: string | undefined,
    actorUserId: string | undefined,
  ): Promise<WompiQrCheckout> {
    const order = await this.ordersService.getOwnedOrFail(businessId, orderId);
    const { reference, amountInCents } = await this.openIntent(
      businessId,
      orderId,
      payerLabel,
      actorUserId,
    );
    const signature = this.computeIntegritySignature(reference, amountInCents);
    const acceptanceToken = await this.fetchAcceptanceToken();
    const isSandbox = this.config.baseUrl.includes('sandbox');

    const response = await fetch(`${this.config.baseUrl}/transactions`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.config.privateKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount_in_cents: amountInCents,
        currency: 'COP',
        signature,
        reference,
        acceptance_token: acceptanceToken,
        customer_email: 'pos@goldenbites.local',
        payment_method: {
          type: 'BANCOLOMBIA_QR',
          payment_description: `Pedido #${order.order_number}`,
          // Only in sandbox — there's no real Bancolombia account to scan the QR with there, so
          // Wompi requires this to simulate an outcome. Omitted in production.
          ...(isSandbox ? { sandbox_status: 'APPROVED' } : {}),
        },
      }),
    });
    if (!response.ok) {
      const body = await response.text();
      throw new BusinessRuleException(
        `Wompi rejected the QR checkout request: ${body}`,
        'WOMPI_QR_CREATE_FAILED',
      );
    }
    const created = (await response.json()) as WompiTransactionResponse;

    const qrImage = await this.pollForQrImage(created.data.id);

    return { reference, wompiTransactionId: created.data.id, qrImage };
  }

  private async openIntent(
    businessId: string,
    orderId: string,
    payerLabel: string | undefined,
    actorUserId: string | undefined,
  ): Promise<{ reference: string; amountInCents: number }> {
    const order = await this.ordersService.getOwnedOrFail(businessId, orderId);
    const payments = await this.paymentsService.findByOrder(businessId, orderId);
    const amountPaid = payments.reduce((sum, p) => sum + p.amount, 0);
    const balanceDue = round2(parseFloat(order.total_amount) - amountPaid);
    if (balanceDue <= 0) {
      throw new BusinessRuleException(
        'This order has no pending balance to charge',
        'ORDER_FULLY_PAID',
      );
    }

    const amountInCents = Math.round(balanceDue * 100);
    const reference = `gbpos-${orderId.slice(0, 8)}-${randomUUID().slice(0, 8)}`;

    await this.intentsRepository.create(
      { businessId, orderId, reference, amountInCents, payerLabel },
      actorUserId,
    );

    return { reference, amountInCents };
  }

  async confirmTransaction(
    businessId: string,
    orderId: string,
    reference: string,
    wompiTransactionId: string,
    actorUserId: string | undefined,
  ): Promise<WompiConfirmResult> {
    const intent = await this.intentsRepository.findByReference(reference);
    if (!intent || intent.business_id !== businessId || intent.order_id !== orderId) {
      throw new BusinessRuleException('Unknown Wompi payment intent', 'WOMPI_INTENT_NOT_FOUND');
    }

    if (intent.status !== 'PENDING') {
      // Already resolved (e.g. the redirect fired twice) — return what we already have instead
      // of charging or erroring again.
      const existing = intent.payment_id
        ? await this.paymentsService.findByOrder(businessId, orderId).then((rows) =>
            rows.find((p) => p.id === intent.payment_id) ?? null,
          )
        : null;
      return { intent, payment: existing };
    }

    const transaction = await this.fetchTransaction(wompiTransactionId);
    if (
      transaction.reference !== intent.reference ||
      transaction.amount_in_cents !== Number(intent.amount_in_cents)
    ) {
      throw new BusinessRuleException(
        'The Wompi transaction does not match the payment intent it claims to resolve',
        'WOMPI_TRANSACTION_MISMATCH',
      );
    }

    if (transaction.status !== 'APPROVED') {
      const resolved = await this.intentsRepository.markResolved(
        intent.id,
        transaction.status,
        transaction.id,
        null,
      );
      return { intent: resolved ?? intent, payment: null };
    }

    const payment = await this.paymentsService.create(
      businessId,
      {
        orderId,
        paymentMethod: WOMPI_METHOD_MAP[transaction.payment_method_type] ?? PaymentMethod.OTHER,
        amount: transaction.amount_in_cents / 100,
        reference: transaction.id,
        payerLabel: intent.payer_label ?? undefined,
      },
      actorUserId,
    );

    const resolved = await this.intentsRepository.markResolved(
      intent.id,
      'APPROVED',
      transaction.id,
      payment.id,
    );

    return { intent: resolved ?? intent, payment };
  }

  /** Ready for when the events webhook is wired up (requires HTTPS) — verifies Wompi's signature. */
  verifyEventChecksum(
    properties: string[],
    propertyValues: string[],
    timestamp: number,
    checksum: string,
  ): boolean {
    const raw = propertyValues.join('') + String(timestamp) + this.config.eventsSecret;
    const expected = createHash('sha256').update(raw).digest('hex');
    return expected.toLowerCase() === checksum.toLowerCase();
  }

  private computeIntegritySignature(reference: string, amountInCents: number): string {
    const raw = `${reference}${amountInCents}COP${this.config.integritySecret}`;
    return createHash('sha256').update(raw).digest('hex');
  }

  private async fetchAcceptanceToken(): Promise<string> {
    const response = await fetch(`${this.config.baseUrl}/merchants/${this.config.publicKey}`);
    if (!response.ok) {
      throw new BusinessRuleException(
        `Could not reach Wompi to start the checkout (HTTP ${response.status})`,
        'WOMPI_MERCHANT_LOOKUP_FAILED',
      );
    }
    const body = (await response.json()) as {
      data: { presigned_acceptance: { acceptance_token: string } };
    };
    return body.data.presigned_acceptance.acceptance_token;
  }

  /** The QR image isn't in the transaction until Wompi finishes generating it — a few quick retries. */
  private async pollForQrImage(transactionId: string): Promise<string> {
    for (let attempt = 0; attempt < 10; attempt++) {
      const transaction = await this.fetchTransaction(transactionId);
      const qrImage = transaction.payment_method?.extra?.qr_image;
      if (qrImage) {
        return qrImage;
      }
      await sleep(500);
    }
    throw new BusinessRuleException(
      'Wompi did not return a QR code in time — try again.',
      'WOMPI_QR_NOT_READY',
    );
  }

  private async fetchTransaction(transactionId: string): Promise<WompiTransactionResponse['data']> {
    const response = await fetch(`${this.config.baseUrl}/transactions/${transactionId}`, {
      headers: { Authorization: `Bearer ${this.config.privateKey}` },
    });
    if (!response.ok) {
      throw new BusinessRuleException(
        `Could not verify the transaction with Wompi (HTTP ${response.status})`,
        'WOMPI_LOOKUP_FAILED',
      );
    }
    const body = (await response.json()) as WompiTransactionResponse;
    return body.data;
  }
}

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
