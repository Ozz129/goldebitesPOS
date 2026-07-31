import { BusinessesController } from './businesses.controller';
import { BusinessesService } from '../services/businesses.service';

describe('BusinessesController', () => {
  let service: jest.Mocked<
    Pick<BusinessesService, 'create' | 'findById' | 'update' | 'setActive'>
  >;
  let controller: BusinessesController;

  beforeEach(() => {
    service = {
      create: jest.fn(),
      findById: jest.fn(),
      update: jest.fn(),
      setActive: jest.fn(),
    };
    controller = new BusinessesController(
      service as unknown as BusinessesService,
    );
  });

  it('create() delegates to the service with the acting user id', async () => {
    service.create.mockResolvedValue({ id: 'b1' } as never);

    await controller.create('actor-1', { name: 'Golden Bites' });

    expect(service.create).toHaveBeenCalledWith(
      { name: 'Golden Bites' },
      'actor-1',
    );
  });

  it('findMine() looks up the current business', async () => {
    service.findById.mockResolvedValue({ id: 'b1' } as never);

    const result = await controller.findMine('b1');

    expect(service.findById).toHaveBeenCalledWith('b1');
    expect(result).toEqual({ id: 'b1' });
  });

  it('updateMine() scopes the update to the current business and actor', async () => {
    service.update.mockResolvedValue({ id: 'b1' } as never);

    await controller.updateMine('b1', 'actor-1', { name: 'New Name' });

    expect(service.update).toHaveBeenCalledWith(
      'b1',
      { name: 'New Name' },
      'actor-1',
    );
  });

  it('setMyStatus() toggles the current business', async () => {
    service.setActive.mockResolvedValue({ id: 'b1' } as never);

    await controller.setMyStatus('b1', 'actor-1', { isActive: false });

    expect(service.setActive).toHaveBeenCalledWith('b1', false, 'actor-1');
  });
});
