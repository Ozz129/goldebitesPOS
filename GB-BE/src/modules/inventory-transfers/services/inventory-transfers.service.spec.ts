import {
  BusinessRuleException,
  EntityNotFoundException,
} from '../../../common/exceptions';
import { InventoryMovementType } from '../../inventory-movements/domain/inventory-movement.types';
import {
  InventoryTransferItemRow,
  InventoryTransferRow,
  TransferStatus,
} from '../domain/inventory-transfer.interface';
import { InventoryTransfersService } from './inventory-transfers.service';

describe('InventoryTransfersService', () => {
  let repository: {
    create: jest.Mock;
    findById: jest.Mock;
    findAll: jest.Mock;
    addItems: jest.Mock;
    findItems: jest.Mock;
    setStatus: jest.Mock;
  };
  let branchesService: { findOne: jest.Mock };
  let inventoryItemsService: { getOwnedOrFail: jest.Mock };
  let movementsService: { recordMovement: jest.Mock };
  let transactionService: { execute: jest.Mock };
  let auditService: { record: jest.Mock };
  let service: InventoryTransfersService;

  const businessId = 'business-1';
  const fromBranchId = 'branch-1';
  const toBranchId = 'branch-2';

  function makeRow(
    overrides: Partial<InventoryTransferRow> = {},
  ): InventoryTransferRow {
    return {
      id: 'transfer-1',
      business_id: businessId,
      from_branch_id: fromBranchId,
      to_branch_id: toBranchId,
      from_location_id: null,
      to_location_id: null,
      status: TransferStatus.PENDING,
      requested_by: null,
      completed_by: null,
      created_at: new Date(),
      completed_at: null,
      notes: null,
      ...overrides,
    };
  }

  function makeItemRow(
    overrides: Partial<InventoryTransferItemRow> = {},
  ): InventoryTransferItemRow {
    return {
      id: 'ti-1',
      transfer_id: 'transfer-1',
      inventory_item_id: 'item-1',
      inventory_item_name: 'Flour',
      quantity: '20.000',
      ...overrides,
    };
  }

  beforeEach(() => {
    repository = {
      create: jest.fn(),
      findById: jest.fn(),
      findAll: jest.fn().mockResolvedValue({ rows: [], total: 0 }),
      addItems: jest.fn(),
      findItems: jest.fn().mockResolvedValue([]),
      setStatus: jest.fn(),
    };
    branchesService = {
      findOne: jest.fn().mockResolvedValue({ id: fromBranchId }),
    };
    inventoryItemsService = {
      getOwnedOrFail: jest.fn().mockResolvedValue({ id: 'item-1' }),
    };
    movementsService = { recordMovement: jest.fn().mockResolvedValue({}) };
    transactionService = {
      execute: jest.fn((work: (client: unknown) => Promise<unknown>) =>
        work({}),
      ),
    };
    auditService = { record: jest.fn() };

    service = new InventoryTransfersService(
      repository,
      branchesService as never,
      inventoryItemsService as never,
      movementsService as never,
      transactionService as never,
      auditService as never,
    );
  });

  describe('create', () => {
    it('rejects an empty item list', async () => {
      await expect(
        service.create({ businessId, fromBranchId, toBranchId }, []),
      ).rejects.toThrow(BusinessRuleException);
    });

    it('rejects same branch and same (null) location as source and destination', async () => {
      await expect(
        service.create({ businessId, fromBranchId, toBranchId: fromBranchId }, [
          { inventoryItemId: 'item-1', quantity: 5 },
        ]),
      ).rejects.toThrow(BusinessRuleException);
    });

    it('allows same branch when locations differ', async () => {
      repository.create.mockResolvedValue(
        makeRow({ to_branch_id: fromBranchId }),
      );

      await service.create(
        {
          businessId,
          fromBranchId,
          toBranchId: fromBranchId,
          fromLocationId: 'loc-1',
          toLocationId: 'loc-2',
        },
        [{ inventoryItemId: 'item-1', quantity: 5 }],
      );

      expect(repository.create).toHaveBeenCalled();
    });

    it('rejects duplicate items in the same transfer', async () => {
      await expect(
        service.create({ businessId, fromBranchId, toBranchId }, [
          { inventoryItemId: 'item-1', quantity: 5 },
          { inventoryItemId: 'item-1', quantity: 3 },
        ]),
      ).rejects.toThrow(BusinessRuleException);
    });
  });

  describe('complete', () => {
    it('records TRANSFER_OUT at the source and TRANSFER_IN at the destination for every item', async () => {
      repository.findById.mockResolvedValue(makeRow());
      repository.findItems.mockResolvedValue([makeItemRow()]);
      repository.setStatus.mockResolvedValue(
        makeRow({ status: TransferStatus.COMPLETED }),
      );

      await service.complete(businessId, 'transfer-1', 'actor-1');

      expect(movementsService.recordMovement).toHaveBeenCalledWith(
        expect.objectContaining({
          movementType: InventoryMovementType.TRANSFER_OUT,
          branchId: fromBranchId,
        }),
        expect.anything(),
      );
      expect(movementsService.recordMovement).toHaveBeenCalledWith(
        expect.objectContaining({
          movementType: InventoryMovementType.TRANSFER_IN,
          branchId: toBranchId,
        }),
        expect.anything(),
      );
    });

    it('rejects completing a transfer that is not PENDING', async () => {
      repository.findById.mockResolvedValue(
        makeRow({ status: TransferStatus.COMPLETED }),
      );

      await expect(service.complete(businessId, 'transfer-1')).rejects.toThrow(
        BusinessRuleException,
      );
    });

    it('throws EntityNotFoundException when the transfer does not exist', async () => {
      repository.findById.mockResolvedValue(null);

      await expect(service.complete(businessId, 'missing')).rejects.toThrow(
        EntityNotFoundException,
      );
    });
  });

  describe('cancel', () => {
    it('cancels a pending transfer', async () => {
      repository.findById.mockResolvedValue(makeRow());
      repository.setStatus.mockResolvedValue(
        makeRow({ status: TransferStatus.CANCELLED }),
      );

      const result = await service.cancel(businessId, 'transfer-1', 'actor-1');

      expect(result.status).toBe(TransferStatus.CANCELLED);
    });

    it('rejects cancelling an already-completed transfer', async () => {
      repository.findById.mockResolvedValue(
        makeRow({ status: TransferStatus.COMPLETED }),
      );

      await expect(service.cancel(businessId, 'transfer-1')).rejects.toThrow(
        BusinessRuleException,
      );
    });
  });
});
