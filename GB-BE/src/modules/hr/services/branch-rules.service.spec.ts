import { BranchRuleRow } from '../domain/branch-rule.interface';
import { BranchRulesService } from './branch-rules.service';

describe('BranchRulesService', () => {
  let branchRulesRepository: { findAllByBranch: jest.Mock; replaceAll: jest.Mock };
  let branchesService: { findOne: jest.Mock };
  let transactionService: { execute: jest.Mock };
  let auditService: { record: jest.Mock };
  let service: BranchRulesService;

  const businessId = 'business-1';
  const branchId = 'branch-1';
  const actorUserId = 'user-1';

  function makeRow(overrides: Partial<BranchRuleRow> = {}): BranchRuleRow {
    return {
      id: 'rule-1',
      business_id: businessId,
      branch_id: branchId,
      title: 'Uniforme',
      description: 'Camisa negra y delantal',
      display_order: 0,
      created_at: new Date(),
      updated_at: new Date(),
      ...overrides,
    };
  }

  beforeEach(() => {
    branchRulesRepository = {
      findAllByBranch: jest.fn().mockResolvedValue([]),
      replaceAll: jest.fn().mockResolvedValue([]),
    };
    branchesService = { findOne: jest.fn().mockResolvedValue({ id: branchId }) };
    transactionService = { execute: jest.fn((fn: (client: unknown) => unknown) => fn(undefined)) };
    auditService = { record: jest.fn() };
    service = new BranchRulesService(
      branchRulesRepository as never,
      branchesService as never,
      transactionService as never,
      auditService as never,
    );
  });

  describe('findAllByBranch', () => {
    it('validates the branch and maps every row in display_order', async () => {
      branchRulesRepository.findAllByBranch.mockResolvedValue([makeRow()]);

      const result = await service.findAllByBranch(businessId, branchId);

      expect(branchesService.findOne).toHaveBeenCalledWith(businessId, branchId);
      expect(result).toHaveLength(1);
      expect(result[0].title).toBe('Uniforme');
    });
  });

  describe('replaceAll', () => {
    it('validates the branch, replaces inside a transaction, and audits the count', async () => {
      const items = [{ title: 'Uniforme', description: 'Camisa negra' }, { title: 'Puntualidad' }];
      branchRulesRepository.replaceAll.mockResolvedValue([
        makeRow({ title: 'Uniforme' }),
        makeRow({ id: 'rule-2', title: 'Puntualidad', description: null, display_order: 1 }),
      ]);

      const result = await service.replaceAll(businessId, branchId, items, actorUserId);

      expect(branchesService.findOne).toHaveBeenCalledWith(businessId, branchId);
      expect(transactionService.execute).toHaveBeenCalled();
      expect(branchRulesRepository.replaceAll).toHaveBeenCalledWith(
        businessId,
        branchId,
        items,
        undefined,
      );
      expect(auditService.record).toHaveBeenCalledWith(
        expect.objectContaining({
          entityType: 'branch_rules',
          action: 'SET',
          newValues: { count: 2 },
        }),
      );
      expect(result).toHaveLength(2);
    });

    it('allows replacing with an empty list (clearing all rules)', async () => {
      const result = await service.replaceAll(businessId, branchId, [], actorUserId);

      expect(branchRulesRepository.replaceAll).toHaveBeenCalledWith(businessId, branchId, [], undefined);
      expect(auditService.record).toHaveBeenCalledWith(
        expect.objectContaining({ newValues: { count: 0 } }),
      );
      expect(result).toEqual([]);
    });
  });
});
