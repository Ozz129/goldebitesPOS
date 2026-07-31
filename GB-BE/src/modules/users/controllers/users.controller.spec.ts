import { UserStatus } from '../domain/user.types';
import { UsersController } from './users.controller';
import { UsersService } from '../services/users.service';

describe('UsersController', () => {
  let service: jest.Mocked<
    Pick<
      UsersService,
      'create' | 'findAll' | 'findOne' | 'update' | 'setStatus' | 'softDelete'
    >
  >;
  let controller: UsersController;

  beforeEach(() => {
    service = {
      create: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      setStatus: jest.fn(),
      softDelete: jest.fn(),
    };
    controller = new UsersController(service as unknown as UsersService);
  });

  it('create() delegates to the service with the business and actor', async () => {
    service.create.mockResolvedValue({ id: 'user-1' } as never);

    const dto = {
      firstName: 'Ada',
      lastName: 'Lovelace',
      email: 'ada@goldenbites.local',
      password: 'SuperSecret1',
      roleId: 'role-1',
    };

    await controller.create('business-1', 'actor-1', dto);

    expect(service.create).toHaveBeenCalledWith('business-1', dto, 'actor-1');
  });

  it('findAll() forwards query filters', async () => {
    service.findAll.mockResolvedValue({ data: [], meta: {} } as never);

    await controller.findAll('business-1', {
      page: 1,
      limit: 20,
      sortOrder: 'DESC' as never,
      status: UserStatus.ACTIVE,
      roleId: 'role-1',
      branchId: 'branch-1',
      search: 'ada',
    });

    expect(service.findAll).toHaveBeenCalledWith({
      businessId: 'business-1',
      page: 1,
      limit: 20,
      status: UserStatus.ACTIVE,
      roleId: 'role-1',
      branchId: 'branch-1',
      search: 'ada',
    });
  });

  it('findMe() looks up the caller by their own id', async () => {
    service.findOne.mockResolvedValue({ id: 'user-1' } as never);

    await controller.findMe('business-1', 'user-1');

    expect(service.findOne).toHaveBeenCalledWith('business-1', 'user-1');
  });

  it('update() delegates the patch', async () => {
    service.update.mockResolvedValue({ id: 'user-1' } as never);

    await controller.update('business-1', 'actor-1', 'user-1', {
      firstName: 'Grace',
    });

    expect(service.update).toHaveBeenCalledWith(
      'business-1',
      'user-1',
      { firstName: 'Grace' },
      'actor-1',
    );
  });

  it('setStatus() changes the account status', async () => {
    service.setStatus.mockResolvedValue({ id: 'user-1' } as never);

    await controller.setStatus('business-1', 'actor-1', 'user-1', {
      status: UserStatus.BLOCKED,
    });

    expect(service.setStatus).toHaveBeenCalledWith(
      'business-1',
      'user-1',
      UserStatus.BLOCKED,
      'actor-1',
    );
  });

  it('remove() soft-deletes the user', async () => {
    service.softDelete.mockResolvedValue(undefined);

    await controller.remove('business-1', 'actor-1', 'user-1');

    expect(service.softDelete).toHaveBeenCalledWith(
      'business-1',
      'user-1',
      'actor-1',
    );
  });
});
