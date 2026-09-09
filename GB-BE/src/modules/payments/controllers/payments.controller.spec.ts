import { PaymentsController } from './payments.controller';
import { PaymentsService } from '../services/payments.service';

describe('PaymentsController', () => {
  let service: jest.Mocked<
    Pick<PaymentsService, 'create' | 'findByOrder' | 'updateMethod'>
  >;
  let controller: PaymentsController;

  beforeEach(() => {
    service = { create: jest.fn(), findByOrder: jest.fn(), updateMethod: jest.fn() };
    controller = new PaymentsController(service as unknown as PaymentsService);
  });

  it('create() merges the route orderId into the payload', async () => {
    service.create.mockResolvedValue({ id: 'payment-1' } as never);
    await controller.create('business-1', 'actor-1', 'order-1', {
      paymentMethod: 'CASH' as never,
      amount: 10000,
    });
    expect(service.create).toHaveBeenCalledWith(
      'business-1',
      { orderId: 'order-1', paymentMethod: 'CASH', amount: 10000 },
      'actor-1',
    );
  });

  it('findAll() delegates', async () => {
    service.findByOrder.mockResolvedValue([]);
    await controller.findAll('business-1', 'order-1');
    expect(service.findByOrder).toHaveBeenCalledWith('business-1', 'order-1');
  });

  it('updateMethod() delegates', async () => {
    service.updateMethod.mockResolvedValue({ id: 'payment-1' } as never);
    await controller.updateMethod('business-1', 'actor-1', 'order-1', 'payment-1', {
      paymentMethod: 'CASH' as never,
    });
    expect(service.updateMethod).toHaveBeenCalledWith(
      'business-1',
      'order-1',
      'payment-1',
      { paymentMethod: 'CASH' },
      'actor-1',
    );
  });
});
