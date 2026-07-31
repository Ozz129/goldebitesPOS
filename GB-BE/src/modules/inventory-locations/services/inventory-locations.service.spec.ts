import {
  ConflictException,
  EntityNotFoundException,
} from '../../../common/exceptions';
import { InventoryLocationRow } from '../domain/inventory-location.interface';
import { InventoryLocationsService } from './inventory-locations.service';

describe('InventoryLocationsService', () => {
  let repository: {
    create: jest.Mock;
    findAll: jest.Mock;
    findById: jest.Mock;
    update: jest.Mock;
    setActive: jest.Mock;
    existsByName: jest.Mock;
  };
  let branchesService: { findOne: jest.Mock };
  let auditService: { record: jest.Mock };
  let service: InventoryLocationsService;

  const businessId = 'business-1';
  const branchId = 'branch-1';

  function makeRow(
    overrides: Partial<InventoryLocationRow> = {},
  ): InventoryLocationRow {
    return {
      id: 'loc-1',
      branch_id: branchId,
      name: 'Main Storage',
      description: null,
      is_active: true,
      created_at: new Date(),
      ...overrides,
    };
  }

  beforeEach(() => {
    repository = {
      create: jest.fn(),
      findAll: jest.fn(),
      findById: jest.fn(),
      update: jest.fn(),
      setActive: jest.fn(),
      existsByName: jest.fn().mockResolvedValue(false),
    };
    branchesService = {
      findOne: jest.fn().mockResolvedValue({ id: branchId }),
    };
    auditService = { record: jest.fn() };
    service = new InventoryLocationsService(
      repository,
      branchesService as never,
      auditService as never,
    );
  });

  describe('create', () => {
    it('validates the branch belongs to the business', async () => {
      repository.create.mockResolvedValue(makeRow());

      await service.create(businessId, { branchId, name: 'Main Storage' });

      expect(branchesService.findOne).toHaveBeenCalledWith(
        businessId,
        branchId,
      );
    });

    it('rejects a duplicate name within the branch', async () => {
      repository.existsByName.mockResolvedValue(true);

      await expect(
        service.create(businessId, { branchId, name: 'Main Storage' }),
      ).rejects.toThrow(ConflictException);
      expect(repository.create).not.toHaveBeenCalled();
    });
  });

  describe('update', () => {
    it('rejects renaming to a name already taken by another location', async () => {
      repository.findById.mockResolvedValue(makeRow());
      repository.existsByName.mockResolvedValue(true);

      await expect(
        service.update(businessId, branchId, 'loc-1', { name: 'Taken' }),
      ).rejects.toThrow(ConflictException);
      expect(repository.existsByName).toHaveBeenCalledWith(
        branchId,
        'Taken',
        'loc-1',
      );
    });

    it('throws EntityNotFoundException when the location does not exist', async () => {
      repository.findById.mockResolvedValue(null);

      await expect(
        service.update(businessId, branchId, 'missing', { name: 'X' }),
      ).rejects.toThrow(EntityNotFoundException);
    });
  });

  describe('setActive', () => {
    it('records an audit entry with ACTIVATE/DEACTIVATE based on the flag', async () => {
      repository.findById.mockResolvedValue(makeRow());
      repository.setActive.mockResolvedValue(makeRow({ is_active: false }));

      await service.setActive(businessId, branchId, 'loc-1', false, 'actor-1');

      expect(auditService.record).toHaveBeenCalledWith(
        expect.objectContaining({ action: 'DEACTIVATE' }),
      );
    });
  });

  describe('findOne', () => {
    it('throws EntityNotFoundException when nothing is found', async () => {
      repository.findById.mockResolvedValue(null);

      await expect(
        service.findOne(businessId, branchId, 'missing'),
      ).rejects.toThrow(EntityNotFoundException);
    });
  });
});
