import { TableNamesController } from './table-names.controller';
import { TableNamesService } from '../services/table-names.service';

describe('TableNamesController', () => {
  let service: jest.Mocked<Pick<TableNamesService, 'findAllByBranch' | 'upsert' | 'clear'>>;
  let controller: TableNamesController;

  beforeEach(() => {
    service = {
      findAllByBranch: jest.fn(),
      upsert: jest.fn(),
      clear: jest.fn(),
    };
    controller = new TableNamesController(service as unknown as TableNamesService);
  });

  it('findAllByBranch() scopes to the current business and forwards the query', async () => {
    service.findAllByBranch.mockResolvedValue([]);
    await controller.findAllByBranch('business-1', { branchId: 'branch-1' });
    expect(service.findAllByBranch).toHaveBeenCalledWith('business-1', 'branch-1');
  });

  it('upsert() scopes to the current business and forwards the actor', async () => {
    service.upsert.mockResolvedValue({} as never);
    await controller.upsert('business-1', 'user-1', {
      branchId: 'branch-1',
      tableNumber: '1',
      name: 'Terraza',
    });
    expect(service.upsert).toHaveBeenCalledWith({
      businessId: 'business-1',
      branchId: 'branch-1',
      tableNumber: '1',
      name: 'Terraza',
      actorUserId: 'user-1',
    });
  });

  it('clear() forwards branchId, tableNumber, and actor', async () => {
    service.clear.mockResolvedValue(undefined);
    await controller.clear('business-1', 'user-1', { branchId: 'branch-1', tableNumber: '1' });
    expect(service.clear).toHaveBeenCalledWith('business-1', 'branch-1', '1', 'user-1');
  });
});
