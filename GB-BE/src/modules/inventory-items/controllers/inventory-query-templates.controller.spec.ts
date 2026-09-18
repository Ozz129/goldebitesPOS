import { InventoryQueryField, InventoryQueryOperator } from '../domain/inventory-query.types';
import { InventoryQueryTemplatesController } from './inventory-query-templates.controller';
import { InventoryQueriesService } from '../services/inventory-queries.service';

describe('InventoryQueryTemplatesController', () => {
  let service: jest.Mocked<
    Pick<InventoryQueriesService, 'listTemplates' | 'createTemplate' | 'runTemplate' | 'deleteTemplate'>
  >;
  let controller: InventoryQueryTemplatesController;

  beforeEach(() => {
    service = {
      listTemplates: jest.fn(),
      createTemplate: jest.fn(),
      runTemplate: jest.fn(),
      deleteTemplate: jest.fn(),
    };
    controller = new InventoryQueryTemplatesController(service as unknown as InventoryQueriesService);
  });

  it('findAll() scopes to the current business', async () => {
    service.listTemplates.mockResolvedValue([]);
    await controller.findAll('business-1');
    expect(service.listTemplates).toHaveBeenCalledWith('business-1');
  });

  it('create() forwards name/conditions and the actor', async () => {
    service.createTemplate.mockResolvedValue({} as never);
    const conditions = [{ field: InventoryQueryField.NAME, operator: InventoryQueryOperator.CONTAINS, value: 'a' }];

    await controller.create('business-1', 'actor-1', { name: 'Mi consulta', conditions });

    expect(service.createTemplate).toHaveBeenCalledWith(
      { businessId: 'business-1', name: 'Mi consulta', conditions },
      'actor-1',
    );
  });

  it('run() forwards the template id and pagination/branch', async () => {
    service.runTemplate.mockResolvedValue({ data: [], meta: {} as never });
    await controller.run('business-1', 'template-1', { branchId: 'branch-1', page: 1, limit: 20 });
    expect(service.runTemplate).toHaveBeenCalledWith('business-1', 'template-1', 'branch-1', 1, 20);
  });

  it('remove() delegates with the actor', async () => {
    service.deleteTemplate.mockResolvedValue(undefined);
    await controller.remove('business-1', 'actor-1', 'template-1');
    expect(service.deleteTemplate).toHaveBeenCalledWith('business-1', 'template-1', 'actor-1');
  });
});
