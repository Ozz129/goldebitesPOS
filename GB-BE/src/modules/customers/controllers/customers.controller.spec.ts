import { CustomersController } from './customers.controller';
import { CustomersService } from '../services/customers.service';

describe('CustomersController', () => {
  let service: jest.Mocked<
    Pick<
      CustomersService,
      | 'create'
      | 'findAll'
      | 'findOne'
      | 'update'
      | 'softDelete'
      | 'addAddress'
      | 'listAddresses'
      | 'removeAddress'
    >
  >;
  let controller: CustomersController;

  beforeEach(() => {
    service = {
      create: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      softDelete: jest.fn(),
      addAddress: jest.fn(),
      listAddresses: jest.fn(),
      removeAddress: jest.fn(),
    };
    controller = new CustomersController(
      service as unknown as CustomersService,
    );
  });

  it('create() scopes to the current business', async () => {
    service.create.mockResolvedValue({ id: 'c1' } as never);
    await controller.create('business-1', 'actor-1', { firstName: 'Ana' });
    expect(service.create).toHaveBeenCalledWith(
      { businessId: 'business-1', firstName: 'Ana' },
      'actor-1',
    );
  });

  it('findAll() forwards the search filter', async () => {
    service.findAll.mockResolvedValue({ data: [], meta: {} } as never);
    await controller.findAll('business-1', {
      page: 1,
      limit: 20,
      sortOrder: 'DESC' as never,
      search: 'ana',
    });
    expect(service.findAll).toHaveBeenCalledWith({
      businessId: 'business-1',
      page: 1,
      limit: 20,
      search: 'ana',
    });
  });

  it('findOne() delegates', async () => {
    service.findOne.mockResolvedValue({ id: 'c1' } as never);
    await controller.findOne('business-1', 'c1');
    expect(service.findOne).toHaveBeenCalledWith('business-1', 'c1');
  });

  it('update() delegates with actor', async () => {
    service.update.mockResolvedValue({ id: 'c1' } as never);
    await controller.update('business-1', 'actor-1', 'c1', {
      firstName: 'New',
    });
    expect(service.update).toHaveBeenCalledWith(
      'business-1',
      'c1',
      { firstName: 'New' },
      'actor-1',
    );
  });

  it('remove() soft-deletes', async () => {
    service.softDelete.mockResolvedValue(undefined);
    await controller.remove('business-1', 'actor-1', 'c1');
    expect(service.softDelete).toHaveBeenCalledWith(
      'business-1',
      'c1',
      'actor-1',
    );
  });

  it('addAddress() delegates', async () => {
    service.addAddress.mockResolvedValue({ id: 'addr-1' } as never);
    await controller.addAddress('business-1', 'c1', { address: 'Calle 1' });
    expect(service.addAddress).toHaveBeenCalledWith('business-1', 'c1', {
      address: 'Calle 1',
    });
  });

  it('listAddresses() delegates', async () => {
    service.listAddresses.mockResolvedValue([]);
    await controller.listAddresses('business-1', 'c1');
    expect(service.listAddresses).toHaveBeenCalledWith('business-1', 'c1');
  });

  it('removeAddress() delegates', async () => {
    service.removeAddress.mockResolvedValue(undefined);
    await controller.removeAddress('business-1', 'c1', 'addr-1');
    expect(service.removeAddress).toHaveBeenCalledWith(
      'business-1',
      'c1',
      'addr-1',
    );
  });
});
