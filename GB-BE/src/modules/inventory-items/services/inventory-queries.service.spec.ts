import { BusinessRuleException, EntityNotFoundException } from '../../../common/exceptions';
import { InventoryQueryField, InventoryQueryOperator } from '../domain/inventory-query.types';
import { InventoryQueriesService } from './inventory-queries.service';

describe('InventoryQueriesService', () => {
  let inventoryItemsRepository: { queryAdvanced: jest.Mock };
  let templatesRepository: {
    create: jest.Mock;
    findAll: jest.Mock;
    findById: jest.Mock;
    delete: jest.Mock;
  };
  let auditService: { record: jest.Mock };
  let service: InventoryQueriesService;

  const businessId = 'business-1';

  beforeEach(() => {
    inventoryItemsRepository = { queryAdvanced: jest.fn().mockResolvedValue({ rows: [], total: 0 }) };
    templatesRepository = {
      create: jest.fn(),
      findAll: jest.fn(),
      findById: jest.fn(),
      delete: jest.fn(),
    };
    auditService = { record: jest.fn() };
    service = new InventoryQueriesService(
      inventoryItemsRepository as never,
      templatesRepository as never,
      auditService as never,
    );
  });

  describe('run — condition validation', () => {
    it('rejects an operator not valid for the field type (contains on a number field)', async () => {
      await expect(
        service.run({
          businessId,
          conditions: [
            { field: InventoryQueryField.MINIMUM_STOCK, operator: InventoryQueryOperator.CONTAINS, value: 5 },
          ],
          page: 1,
          limit: 20,
        }),
      ).rejects.toThrow(BusinessRuleException);
      expect(inventoryItemsRepository.queryAdvanced).not.toHaveBeenCalled();
    });

    it('rejects "between" missing the second bound', async () => {
      await expect(
        service.run({
          businessId,
          conditions: [
            { field: InventoryQueryField.CURRENT_COST, operator: InventoryQueryOperator.BETWEEN, value: 1000 },
          ],
          page: 1,
          limit: 20,
        }),
      ).rejects.toThrow(BusinessRuleException);
    });

    it('rejects "in" with an empty values array', async () => {
      await expect(
        service.run({
          businessId,
          conditions: [{ field: InventoryQueryField.CATEGORY_ID, operator: InventoryQueryOperator.IN, values: [] }],
          page: 1,
          limit: 20,
        }),
      ).rejects.toThrow(BusinessRuleException);
    });

    it('rejects a comparison operator with no value', async () => {
      await expect(
        service.run({
          businessId,
          conditions: [{ field: InventoryQueryField.NAME, operator: InventoryQueryOperator.CONTAINS }],
          page: 1,
          limit: 20,
        }),
      ).rejects.toThrow(BusinessRuleException);
    });

    it('allows "isEmpty"/"isNotEmpty" with no value at all', async () => {
      await expect(
        service.run({
          businessId,
          conditions: [{ field: InventoryQueryField.SKU, operator: InventoryQueryOperator.IS_EMPTY }],
          page: 1,
          limit: 20,
        }),
      ).resolves.toBeDefined();
      expect(inventoryItemsRepository.queryAdvanced).toHaveBeenCalled();
    });

    it('accepts a valid multi-condition query and delegates to the repository', async () => {
      const conditions = [
        { field: InventoryQueryField.CATEGORY_ID, operator: InventoryQueryOperator.EQUALS, value: 'cat-1' },
        { field: InventoryQueryField.CURRENT_STOCK, operator: InventoryQueryOperator.LESS_THAN, value: 10 },
      ];

      await service.run({ businessId, conditions, page: 1, limit: 20 });

      expect(inventoryItemsRepository.queryAdvanced).toHaveBeenCalledWith(
        expect.objectContaining({ businessId, conditions, page: 1, limit: 20 }),
      );
    });
  });

  describe('templates', () => {
    it('createTemplate validates conditions before saving', async () => {
      await expect(
        service.createTemplate(
          {
            businessId,
            name: 'Bad template',
            conditions: [{ field: InventoryQueryField.IS_ACTIVE, operator: InventoryQueryOperator.CONTAINS, value: true }],
          },
          'user-1',
        ),
      ).rejects.toThrow(BusinessRuleException);
      expect(templatesRepository.create).not.toHaveBeenCalled();
    });

    it('createTemplate saves and audits a valid template', async () => {
      templatesRepository.create.mockResolvedValue({
        id: 'template-1',
        business_id: businessId,
        name: 'Bajo stock',
        conditions: [{ field: InventoryQueryField.CURRENT_STOCK, operator: InventoryQueryOperator.LESS_THAN, value: 5 }],
        created_by: 'user-1',
        created_at: new Date(),
        updated_at: new Date(),
      });

      const result = await service.createTemplate(
        {
          businessId,
          name: 'Bajo stock',
          conditions: [{ field: InventoryQueryField.CURRENT_STOCK, operator: InventoryQueryOperator.LESS_THAN, value: 5 }],
        },
        'user-1',
      );

      expect(result.name).toBe('Bajo stock');
      expect(auditService.record).toHaveBeenCalledWith(
        expect.objectContaining({ entityType: 'inventory_query_template', action: 'CREATE' }),
      );
    });

    it('deleteTemplate throws EntityNotFoundException when nothing was deleted', async () => {
      templatesRepository.delete.mockResolvedValue(false);
      await expect(service.deleteTemplate(businessId, 'missing-id')).rejects.toThrow(EntityNotFoundException);
    });

    it('runTemplate re-validates the stored conditions before executing', async () => {
      templatesRepository.findById.mockResolvedValue({
        id: 'template-1',
        business_id: businessId,
        name: 'Legacy template',
        // Simulates a template saved before a field/operator combo was made invalid.
        conditions: [{ field: InventoryQueryField.MINIMUM_STOCK, operator: InventoryQueryOperator.CONTAINS, value: 5 }],
        created_by: null,
        created_at: new Date(),
        updated_at: new Date(),
      });

      await expect(service.runTemplate(businessId, 'template-1', undefined, 1, 20)).rejects.toThrow(
        BusinessRuleException,
      );
    });

    it('runTemplate throws EntityNotFoundException for an unknown template', async () => {
      templatesRepository.findById.mockResolvedValue(null);
      await expect(service.runTemplate(businessId, 'missing-id', undefined, 1, 20)).rejects.toThrow(
        EntityNotFoundException,
      );
    });
  });
});
