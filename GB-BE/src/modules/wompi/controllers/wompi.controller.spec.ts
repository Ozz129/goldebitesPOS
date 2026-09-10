import { WompiController } from './wompi.controller';
import { WompiService } from '../services/wompi.service';

describe('WompiController', () => {
  let service: jest.Mocked<
    Pick<WompiService, 'createIntent' | 'createQrCheckout' | 'confirmTransaction'>
  >;
  let controller: WompiController;

  beforeEach(() => {
    service = { createIntent: jest.fn(), createQrCheckout: jest.fn(), confirmTransaction: jest.fn() };
    controller = new WompiController(service as unknown as WompiService);
  });

  it('createIntent() delegates with the actor and payer label', async () => {
    service.createIntent.mockResolvedValue({} as never);
    await controller.createIntent('business-1', 'actor-1', 'order-1', { payerLabel: 'Persona 1' });
    expect(service.createIntent).toHaveBeenCalledWith('business-1', 'order-1', 'Persona 1', 'actor-1');
  });

  it('createQrCheckout() delegates with the actor and payer label', async () => {
    service.createQrCheckout.mockResolvedValue({} as never);
    await controller.createQrCheckout('business-1', 'actor-1', 'order-1', { payerLabel: 'Mesa 3' });
    expect(service.createQrCheckout).toHaveBeenCalledWith('business-1', 'order-1', 'Mesa 3', 'actor-1');
  });

  it('confirmTransaction() delegates with the reference and Wompi transaction id', async () => {
    service.confirmTransaction.mockResolvedValue({} as never);
    await controller.confirmTransaction('business-1', 'actor-1', 'order-1', 'ref-1', {
      wompiTransactionId: 'wtx-1',
    });
    expect(service.confirmTransaction).toHaveBeenCalledWith(
      'business-1',
      'order-1',
      'ref-1',
      'wtx-1',
      'actor-1',
    );
  });
});
