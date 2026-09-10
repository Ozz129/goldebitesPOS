import { createHash } from 'node:crypto';
import { BusinessRuleException } from '../../../common/exceptions';
import { PaymentMethod } from '../../cash-sessions/domain/cash-session.interface';
import { WompiIntentRow } from '../domain/wompi.types';
import { WompiService } from './wompi.service';

describe('WompiService', () => {
  let intentsRepository: {
    create: jest.Mock;
    findByReference: jest.Mock;
    markResolved: jest.Mock;
  };
  let ordersService: { getOwnedOrFail: jest.Mock };
  let paymentsService: { findByOrder: jest.Mock; create: jest.Mock };
  let configService: { getOrThrow: jest.Mock };
  let service: WompiService;
  let fetchMock: jest.Mock;

  const businessId = 'business-1';
  const orderId = 'order-1';

  function makeIntent(overrides: Partial<WompiIntentRow> = {}): WompiIntentRow {
    return {
      id: 'intent-1',
      business_id: businessId,
      order_id: orderId,
      reference: 'gbpos-order1-abc123',
      amount_in_cents: '1000000',
      payer_label: null,
      status: 'PENDING',
      wompi_transaction_id: null,
      payment_id: null,
      created_by: null,
      created_at: new Date(),
      updated_at: new Date(),
      ...overrides,
    };
  }

  beforeEach(() => {
    intentsRepository = {
      create: jest.fn().mockResolvedValue(makeIntent()),
      findByReference: jest.fn(),
      markResolved: jest.fn(),
    };
    ordersService = {
      getOwnedOrFail: jest.fn().mockResolvedValue({
        id: orderId,
        business_id: businessId,
        total_amount: '10000.00',
        order_number: '0910-01',
      }),
    };
    paymentsService = {
      findByOrder: jest.fn().mockResolvedValue([]),
      create: jest.fn(),
    };
    configService = {
      getOrThrow: jest.fn().mockReturnValue({
        wompi: {
          enabled: true,
          publicKey: 'pub_test_123',
          privateKey: 'prv_test_123',
          integritySecret: 'integrity-secret',
          eventsSecret: 'events-secret',
          baseUrl: 'https://sandbox.wompi.co/v1',
        },
      }),
    };
    fetchMock = jest.fn();
    global.fetch = fetchMock as never;

    service = new WompiService(
      intentsRepository,
      ordersService as never,
      paymentsService as never,
      configService as never,
    );
  });

  describe('isEnabled', () => {
    it('reflects the configured flag', () => {
      expect(service.isEnabled()).toBe(true);
    });
  });

  describe('createIntent', () => {
    it('rejects when the order has no pending balance', async () => {
      paymentsService.findByOrder.mockResolvedValue([{ id: 'p1', amount: 10000 }]);

      await expect(
        service.createIntent(businessId, orderId, undefined, 'actor-1'),
      ).rejects.toThrow(BusinessRuleException);
      expect(intentsRepository.create).not.toHaveBeenCalled();
    });

    it('creates an intent for the outstanding balance, in cents', async () => {
      paymentsService.findByOrder.mockResolvedValue([{ id: 'p1', amount: 4000 }]);

      const params = await service.createIntent(businessId, orderId, 'Persona 1', 'actor-1');

      expect(intentsRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({ businessId, orderId, amountInCents: 600000, payerLabel: 'Persona 1' }),
        'actor-1',
      );
      expect(params.amountInCents).toBe(600000);
      expect(params.currency).toBe('COP');
      expect(params.publicKey).toBe('pub_test_123');
      expect(params.signature).toHaveLength(64); // sha256 hex digest
    });
  });

  describe('createQrCheckout', () => {
    it('rejects when the order has no pending balance', async () => {
      paymentsService.findByOrder.mockResolvedValue([{ id: 'p1', amount: 10000 }]);

      await expect(
        service.createQrCheckout(businessId, orderId, undefined, 'actor-1'),
      ).rejects.toThrow(BusinessRuleException);
      expect(fetchMock).not.toHaveBeenCalled();
    });

    it('creates the transaction with sandbox_status when the base URL is sandbox, and returns the QR once ready', async () => {
      // First fetch call (acceptance token) uses this one-time implementation.
      fetchMock.mockImplementationOnce((url: string) =>
        Promise.resolve({
          ok: true,
          json: async () => ({ data: { presigned_acceptance: { acceptance_token: 'accept-me' } } }),
        }),
      );

      let pollCount = 0;
      fetchMock.mockImplementation((url: string, init?: RequestInit) => {
        if (url.includes('/merchants/')) {
          return Promise.resolve({
            ok: true,
            json: async () => ({ data: { presigned_acceptance: { acceptance_token: 'accept-me' } } }),
          });
        }
        if (init?.method === 'POST' && url.endsWith('/transactions')) {
          const body = JSON.parse(init.body as string);
          expect(body.payment_method.sandbox_status).toBe('APPROVED');
          expect(body.payment_method.type).toBe('BANCOLOMBIA_QR');
          return Promise.resolve({
            ok: true,
            json: async () => ({ data: { id: 'wtx-qr-1', status: 'PENDING' } }),
          });
        }
        // GET /transactions/:id (polling)
        pollCount += 1;
        const qrReady = pollCount >= 2;
        return Promise.resolve({
          ok: true,
          json: async () => ({
            data: {
              id: 'wtx-qr-1',
              status: 'PENDING',
              payment_method: qrReady ? { extra: { qr_image: 'base64-svg' } } : {},
            },
          }),
        });
      });

      const result = await service.createQrCheckout(businessId, orderId, 'Mesa 3', 'actor-1');

      expect(result).toEqual({
        reference: expect.stringMatching(/^gbpos-/),
        wompiTransactionId: 'wtx-qr-1',
        qrImage: 'base64-svg',
      });
      expect(intentsRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({ payerLabel: 'Mesa 3' }),
        'actor-1',
      );
    });

    it('does not send sandbox_status against a production base URL', async () => {
      configService.getOrThrow.mockReturnValue({
        wompi: {
          enabled: true,
          publicKey: 'pub_prod_123',
          privateKey: 'prv_prod_123',
          integritySecret: 'integrity-secret',
          eventsSecret: 'events-secret',
          baseUrl: 'https://production.wompi.co/v1',
        },
      });
      service = new WompiService(
        intentsRepository,
        ordersService as never,
        paymentsService as never,
        configService as never,
      );

      fetchMock.mockImplementation((url: string, init?: RequestInit) => {
        if (url.includes('/merchants/')) {
          return Promise.resolve({
            ok: true,
            json: async () => ({ data: { presigned_acceptance: { acceptance_token: 'accept-me' } } }),
          });
        }
        if (init?.method === 'POST' && url.endsWith('/transactions')) {
          const body = JSON.parse(init.body as string);
          expect(body.payment_method.sandbox_status).toBeUndefined();
          return Promise.resolve({
            ok: true,
            json: async () => ({ data: { id: 'wtx-qr-2', status: 'PENDING' } }),
          });
        }
        return Promise.resolve({
          ok: true,
          json: async () => ({
            data: { id: 'wtx-qr-2', status: 'PENDING', payment_method: { extra: { qr_image: 'svg' } } },
          }),
        });
      });

      await service.createQrCheckout(businessId, orderId, undefined, 'actor-1');
    });

    it('throws if the QR image never becomes available', async () => {
      fetchMock.mockImplementation((url: string, init?: RequestInit) => {
        if (url.includes('/merchants/')) {
          return Promise.resolve({
            ok: true,
            json: async () => ({ data: { presigned_acceptance: { acceptance_token: 'accept-me' } } }),
          });
        }
        if (init?.method === 'POST' && url.endsWith('/transactions')) {
          return Promise.resolve({
            ok: true,
            json: async () => ({ data: { id: 'wtx-qr-3', status: 'PENDING' } }),
          });
        }
        return Promise.resolve({
          ok: true,
          json: async () => ({ data: { id: 'wtx-qr-3', status: 'PENDING', payment_method: {} } }),
        });
      });

      await expect(
        service.createQrCheckout(businessId, orderId, undefined, 'actor-1'),
      ).rejects.toThrow(BusinessRuleException);
    }, 10000);
  });

  describe('confirmTransaction', () => {
    it('rejects an unknown reference', async () => {
      intentsRepository.findByReference.mockResolvedValue(null);

      await expect(
        service.confirmTransaction(businessId, orderId, 'nope', 'wtx-1', 'actor-1'),
      ).rejects.toThrow(BusinessRuleException);
    });

    it('returns the cached result without re-fetching when already resolved', async () => {
      intentsRepository.findByReference.mockResolvedValue(
        makeIntent({ status: 'APPROVED', payment_id: 'payment-1' }),
      );
      paymentsService.findByOrder.mockResolvedValue([{ id: 'payment-1', amount: 10000 }]);

      const result = await service.confirmTransaction(
        businessId,
        orderId,
        'gbpos-order1-abc123',
        'wtx-1',
        'actor-1',
      );

      expect(fetchMock).not.toHaveBeenCalled();
      expect(result.payment).toEqual({ id: 'payment-1', amount: 10000 });
    });

    it('rejects when the Wompi transaction reference/amount does not match the intent', async () => {
      intentsRepository.findByReference.mockResolvedValue(makeIntent());
      fetchMock.mockResolvedValue({
        ok: true,
        json: async () => ({
          data: { id: 'wtx-1', reference: 'gbpos-order1-abc123', amount_in_cents: 500000, status: 'APPROVED', payment_method_type: 'CARD' },
        }),
      });

      await expect(
        service.confirmTransaction(businessId, orderId, 'gbpos-order1-abc123', 'wtx-1', 'actor-1'),
      ).rejects.toThrow(BusinessRuleException);
      expect(paymentsService.create).not.toHaveBeenCalled();
    });

    it('marks the intent as declined without creating a payment', async () => {
      intentsRepository.findByReference.mockResolvedValue(makeIntent());
      fetchMock.mockResolvedValue({
        ok: true,
        json: async () => ({
          data: { id: 'wtx-1', reference: 'gbpos-order1-abc123', amount_in_cents: 1000000, status: 'DECLINED', payment_method_type: 'CARD' },
        }),
      });

      await service.confirmTransaction(businessId, orderId, 'gbpos-order1-abc123', 'wtx-1', 'actor-1');

      expect(paymentsService.create).not.toHaveBeenCalled();
      expect(intentsRepository.markResolved).toHaveBeenCalledWith('intent-1', 'DECLINED', 'wtx-1', null);
    });

    it('creates a payment mapped from the Wompi payment method when approved', async () => {
      intentsRepository.findByReference.mockResolvedValue(makeIntent({ payer_label: 'Persona 1' }));
      intentsRepository.markResolved.mockResolvedValue(
        makeIntent({ status: 'APPROVED', wompi_transaction_id: 'wtx-1', payment_id: 'payment-1' }),
      );
      paymentsService.create.mockResolvedValue({ id: 'payment-1', amount: 10000 });
      fetchMock.mockResolvedValue({
        ok: true,
        json: async () => ({
          data: { id: 'wtx-1', reference: 'gbpos-order1-abc123', amount_in_cents: 1000000, status: 'APPROVED', payment_method_type: 'NEQUI' },
        }),
      });

      const result = await service.confirmTransaction(
        businessId,
        orderId,
        'gbpos-order1-abc123',
        'wtx-1',
        'actor-1',
      );

      expect(paymentsService.create).toHaveBeenCalledWith(
        businessId,
        {
          orderId,
          paymentMethod: PaymentMethod.NEQUI,
          amount: 10000,
          reference: 'wtx-1',
          payerLabel: 'Persona 1',
        },
        'actor-1',
      );
      expect(intentsRepository.markResolved).toHaveBeenCalledWith('intent-1', 'APPROVED', 'wtx-1', 'payment-1');
      expect(result.payment).toEqual({ id: 'payment-1', amount: 10000 });
    });

    it('maps an unrecognized Wompi payment method to OTHER', async () => {
      intentsRepository.findByReference.mockResolvedValue(makeIntent());
      intentsRepository.markResolved.mockResolvedValue(makeIntent({ status: 'APPROVED' }));
      paymentsService.create.mockResolvedValue({ id: 'payment-1', amount: 10000 });
      fetchMock.mockResolvedValue({
        ok: true,
        json: async () => ({
          data: { id: 'wtx-1', reference: 'gbpos-order1-abc123', amount_in_cents: 1000000, status: 'APPROVED', payment_method_type: 'SOMETHING_NEW' },
        }),
      });

      await service.confirmTransaction(businessId, orderId, 'gbpos-order1-abc123', 'wtx-1', 'actor-1');

      expect(paymentsService.create).toHaveBeenCalledWith(
        businessId,
        expect.objectContaining({ paymentMethod: PaymentMethod.OTHER }),
        'actor-1',
      );
    });

    it('throws when the Wompi lookup itself fails', async () => {
      intentsRepository.findByReference.mockResolvedValue(makeIntent());
      fetchMock.mockResolvedValue({ ok: false, status: 404 });

      await expect(
        service.confirmTransaction(businessId, orderId, 'gbpos-order1-abc123', 'wtx-1', 'actor-1'),
      ).rejects.toThrow(BusinessRuleException);
    });
  });

  describe('verifyEventChecksum', () => {
    it('accepts a correctly computed checksum and rejects a tampered one', () => {
      const properties = ['transaction.id', 'transaction.status'];
      const values = ['wtx-1', 'APPROVED'];
      const timestamp = 1530291411;

      const expected = createHash('sha256')
        .update(values.join('') + String(timestamp) + 'events-secret')
        .digest('hex');

      expect(service.verifyEventChecksum(properties, values, timestamp, expected)).toBe(true);
      expect(service.verifyEventChecksum(properties, values, timestamp, 'tampered')).toBe(false);
    });
  });
});
