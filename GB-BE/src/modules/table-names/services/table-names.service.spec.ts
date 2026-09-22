import { EntityNotFoundException } from '../../../common/exceptions';
import { TableNameRow } from '../domain/table-name.interface';
import { TableNamesService } from './table-names.service';

describe('TableNamesService', () => {
  let tableNamesRepository: {
    upsert: jest.Mock;
    findAllByBranch: jest.Mock;
    findOne: jest.Mock;
    delete: jest.Mock;
  };
  let branchesService: { findOne: jest.Mock };
  let auditService: { record: jest.Mock };
  let service: TableNamesService;

  const businessId = 'business-1';
  const branchId = 'branch-1';
  const actorUserId = 'user-1';

  function makeRow(overrides: Partial<TableNameRow> = {}): TableNameRow {
    return {
      id: 'name-1',
      business_id: businessId,
      branch_id: branchId,
      table_number: '1',
      name: 'Terraza',
      created_at: new Date(),
      updated_at: new Date(),
      ...overrides,
    };
  }

  beforeEach(() => {
    tableNamesRepository = {
      upsert: jest.fn().mockResolvedValue(makeRow()),
      findAllByBranch: jest.fn().mockResolvedValue([]),
      findOne: jest.fn().mockResolvedValue(null),
      delete: jest.fn().mockResolvedValue(true),
    };
    branchesService = { findOne: jest.fn().mockResolvedValue({ id: branchId }) };
    auditService = { record: jest.fn() };
    service = new TableNamesService(
      tableNamesRepository as never,
      branchesService as never,
      auditService as never,
    );
  });

  describe('upsert', () => {
    it('validates the branch and records CREATE-style audit (no oldValues) for a brand new name', async () => {
      tableNamesRepository.findOne.mockResolvedValue(null);

      const result = await service.upsert({
        businessId,
        branchId,
        tableNumber: '1',
        name: 'Terraza',
        actorUserId,
      });

      expect(branchesService.findOne).toHaveBeenCalledWith(businessId, branchId);
      expect(auditService.record).toHaveBeenCalledWith(
        expect.objectContaining({
          entityType: 'table_name',
          action: 'SET',
          oldValues: undefined,
          newValues: { tableNumber: '1', name: 'Terraza' },
        }),
      );
      expect(result.name).toBe('Terraza');
    });

    it('records the previous name as oldValues when renaming an already-named table', async () => {
      tableNamesRepository.findOne.mockResolvedValue(makeRow({ name: 'Mesa vieja' }));
      tableNamesRepository.upsert.mockResolvedValue(makeRow({ name: 'Terraza' }));

      await service.upsert({ businessId, branchId, tableNumber: '1', name: 'Terraza', actorUserId });

      expect(auditService.record).toHaveBeenCalledWith(
        expect.objectContaining({
          oldValues: { name: 'Mesa vieja' },
          newValues: { tableNumber: '1', name: 'Terraza' },
        }),
      );
    });
  });

  describe('findAllByBranch', () => {
    it('validates the branch and maps every row', async () => {
      tableNamesRepository.findAllByBranch.mockResolvedValue([makeRow()]);

      const result = await service.findAllByBranch(businessId, branchId);

      expect(branchesService.findOne).toHaveBeenCalledWith(businessId, branchId);
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('Terraza');
    });
  });

  describe('clear', () => {
    it('deletes the row and records the audit entry', async () => {
      await service.clear(businessId, branchId, '1', actorUserId);

      expect(tableNamesRepository.delete).toHaveBeenCalledWith(businessId, branchId, '1');
      expect(auditService.record).toHaveBeenCalledWith(
        expect.objectContaining({ entityType: 'table_name', action: 'CLEAR' }),
      );
    });

    it('throws EntityNotFoundException when the table had no custom name to clear', async () => {
      tableNamesRepository.delete.mockResolvedValue(false);

      await expect(service.clear(businessId, branchId, '1')).rejects.toThrow(EntityNotFoundException);
    });
  });

  describe('findName', () => {
    it('returns the name when one exists', async () => {
      tableNamesRepository.findOne.mockResolvedValue(makeRow({ name: 'Terraza' }));

      expect(await service.findName(businessId, branchId, '1')).toBe('Terraza');
    });

    it('returns null when the table has no custom name', async () => {
      tableNamesRepository.findOne.mockResolvedValue(null);

      expect(await service.findName(businessId, branchId, '1')).toBeNull();
    });

    it('never re-validates the branch — it is a lean lookup used by the already-validated public token resolver', async () => {
      branchesService.findOne.mockClear();

      await service.findName(businessId, branchId, '1');

      expect(branchesService.findOne).not.toHaveBeenCalled();
    });
  });
});
