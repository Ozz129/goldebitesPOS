import { SortOrder } from '../../../common/pagination/pagination-query.dto';
import { BranchesController } from './branches.controller';
import { BranchesService } from '../services/branches.service';

describe('BranchesController', () => {
  let service: jest.Mocked<
    Pick<
      BranchesService,
      'create' | 'findAll' | 'findOne' | 'update' | 'setActive'
    >
  >;
  let controller: BranchesController;

  beforeEach(() => {
    service = {
      create: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      setActive: jest.fn(),
    };
    controller = new BranchesController(service as unknown as BranchesService);
  });

  it('create() scopes creation to the current business and actor', async () => {
    service.create.mockResolvedValue({ id: 'branch-1' } as never);

    await controller.create('business-1', 'actor-1', { name: 'Sede Norte' });

    expect(service.create).toHaveBeenCalledWith(
      { businessId: 'business-1', name: 'Sede Norte' },
      'actor-1',
    );
  });

  it('findAll() forwards pagination and filters', async () => {
    service.findAll.mockResolvedValue({ data: [], meta: {} } as never);

    await controller.findAll('business-1', {
      page: 2,
      limit: 10,
      sortOrder: SortOrder.DESC,
      isActive: true,
      search: 'norte',
    });

    expect(service.findAll).toHaveBeenCalledWith({
      businessId: 'business-1',
      page: 2,
      limit: 10,
      isActive: true,
      search: 'norte',
    });
  });

  it('findOne() looks up a single branch owned by the business', async () => {
    service.findOne.mockResolvedValue({ id: 'branch-1' } as never);

    await controller.findOne('business-1', 'branch-1');

    expect(service.findOne).toHaveBeenCalledWith('business-1', 'branch-1');
  });

  it('update() delegates with the actor id', async () => {
    service.update.mockResolvedValue({ id: 'branch-1' } as never);

    await controller.update('business-1', 'actor-1', 'branch-1', {
      name: 'Renamed',
    });

    expect(service.update).toHaveBeenCalledWith(
      'business-1',
      'branch-1',
      { name: 'Renamed' },
      'actor-1',
    );
  });

  it('setStatus() toggles active state', async () => {
    service.setActive.mockResolvedValue({ id: 'branch-1' } as never);

    await controller.setStatus('business-1', 'actor-1', 'branch-1', {
      isActive: false,
    });

    expect(service.setActive).toHaveBeenCalledWith(
      'business-1',
      'branch-1',
      false,
      'actor-1',
    );
  });
});
