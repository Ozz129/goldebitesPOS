import { InventoryQueryField, InventoryQueryOperator } from '../domain/inventory-query.types';
import { InventoryQueriesController } from './inventory-queries.controller';
import { InventoryQueriesService } from '../services/inventory-queries.service';

describe('InventoryQueriesController', () => {
  let service: jest.Mocked<Pick<InventoryQueriesService, 'run'>>;
  let controller: InventoryQueriesController;

  beforeEach(() => {
    service = { run: jest.fn() };
    controller = new InventoryQueriesController(service as unknown as InventoryQueriesService);
  });

  it('run() scopes to the current business and forwards conditions/pagination', async () => {
    service.run.mockResolvedValue({ data: [], meta: {} as never });
    const conditions = [{ field: InventoryQueryField.NAME, operator: InventoryQueryOperator.CONTAINS, value: 'a' }];

    await controller.run('business-1', { conditions, branchId: 'branch-1', page: 2, limit: 10 });

    expect(service.run).toHaveBeenCalledWith({
      businessId: 'business-1',
      branchId: 'branch-1',
      conditions,
      page: 2,
      limit: 10,
    });
  });
});
