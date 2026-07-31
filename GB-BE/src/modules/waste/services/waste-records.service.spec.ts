import { InventoryMovementType } from '../../inventory-movements/domain/inventory-movement.types';
import { WasteRecordRow } from '../domain/waste-record.interface';
import { WasteRecordsService } from './waste-records.service';

describe('WasteRecordsService', () => {
  let repository: { create: jest.Mock; findAll: jest.Mock };
  let branchesService: { findOne: jest.Mock };
  let inventoryItemsService: { getOwnedOrFail: jest.Mock };
  let movementsService: { recordMovement: jest.Mock };
  let transactionService: { execute: jest.Mock };
  let auditService: { record: jest.Mock };
  let service: WasteRecordsService;

  const businessId = 'business-1';
  const branchId = 'branch-1';
  const inventoryItemId = 'item-1';

  function makeRow(overrides: Partial<WasteRecordRow> = {}): WasteRecordRow {
    return {
      id: 'waste-1',
      business_id: businessId,
      branch_id: branchId,
      inventory_item_id: inventoryItemId,
      inventory_item_name: 'Ice',
      quantity: '2.000',
      unit_cost: '1000.00',
      reason: 'Melted',
      notes: null,
      recorded_by: null,
      created_at: new Date(),
      ...overrides,
    };
  }

  beforeEach(() => {
    repository = {
      create: jest.fn(),
      findAll: jest.fn().mockResolvedValue({ rows: [], total: 0 }),
    };
    branchesService = {
      findOne: jest.fn().mockResolvedValue({ id: branchId }),
    };
    inventoryItemsService = {
      getOwnedOrFail: jest
        .fn()
        .mockResolvedValue({ id: inventoryItemId, current_cost: '1000.00' }),
    };
    movementsService = { recordMovement: jest.fn().mockResolvedValue({}) };
    transactionService = {
      execute: jest.fn((work: (client: unknown) => Promise<unknown>) =>
        work({}),
      ),
    };
    auditService = { record: jest.fn() };

    service = new WasteRecordsService(
      repository,
      branchesService as never,
      inventoryItemsService as never,
      movementsService as never,
      transactionService as never,
      auditService as never,
    );
  });

  describe('create', () => {
    it('records a WASTE inventory movement using the item current cost as a snapshot', async () => {
      repository.create.mockResolvedValue(makeRow());

      await service.create(
        {
          businessId,
          branchId,
          inventoryItemId,
          quantity: 2,
          reason: 'Melted',
        },
        'actor-1',
      );

      expect(movementsService.recordMovement).toHaveBeenCalledWith(
        expect.objectContaining({
          movementType: InventoryMovementType.WASTE,
          inventoryItemId,
          quantity: 2,
          unitCost: 1000,
          referenceType: 'waste_record',
          referenceId: 'waste-1',
        }),
        expect.anything(),
      );
    });

    it('creates the waste_records row before posting the movement so the reference id is known', async () => {
      repository.create.mockResolvedValue(makeRow());

      await service.create(
        {
          businessId,
          branchId,
          inventoryItemId,
          quantity: 2,
          reason: 'Melted',
        },
        'actor-1',
      );

      const createOrder = repository.create.mock.invocationCallOrder[0];
      const movementOrder =
        movementsService.recordMovement.mock.invocationCallOrder[0];
      expect(createOrder).toBeLessThan(movementOrder);
    });
  });
});
