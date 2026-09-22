import { BranchRuleRow } from '../domain/branch-rule.interface';
import { HrProfileService } from './hr-profile.service';

describe('HrProfileService', () => {
  let branchRulesRepository: { findAllByBranch: jest.Mock };
  let rolesService: { findOne: jest.Mock };
  let service: HrProfileService;

  const businessId = 'business-1';
  const roleId = 'role-1';
  const branchId = 'branch-1';

  function makeRow(overrides: Partial<BranchRuleRow> = {}): BranchRuleRow {
    return {
      id: 'rule-1',
      business_id: businessId,
      branch_id: branchId,
      title: 'Puntualidad',
      description: null,
      display_order: 0,
      created_at: new Date(),
      updated_at: new Date(),
      ...overrides,
    };
  }

  beforeEach(() => {
    branchRulesRepository = { findAllByBranch: jest.fn().mockResolvedValue([]) };
    rolesService = {
      findOne: jest.fn().mockResolvedValue({
        id: roleId,
        businessId,
        name: 'CASHIER',
        description: 'Atiende caja y pedidos en mostrador',
        createdAt: new Date(),
        permissions: [],
      }),
    };
    service = new HrProfileService(branchRulesRepository as never, rolesService as never);
  });

  it('composes the role description with the branch rules when the user has a branch', async () => {
    branchRulesRepository.findAllByBranch.mockResolvedValue([makeRow()]);

    const result = await service.getMyProfile(businessId, roleId, branchId);

    expect(rolesService.findOne).toHaveBeenCalledWith(businessId, roleId);
    expect(branchRulesRepository.findAllByBranch).toHaveBeenCalledWith(businessId, branchId);
    expect(result.role).toEqual({ name: 'CASHIER', description: 'Atiende caja y pedidos en mostrador' });
    expect(result.branchRules).toHaveLength(1);
    expect(result.branchRules[0].title).toBe('Puntualidad');
  });

  it('returns an empty branchRules list without querying the repository when branchId is null', async () => {
    const result = await service.getMyProfile(businessId, roleId, null);

    expect(branchRulesRepository.findAllByBranch).not.toHaveBeenCalled();
    expect(result.branchRules).toEqual([]);
  });

  it('surfaces a null role description as-is', async () => {
    rolesService.findOne.mockResolvedValue({
      id: roleId,
      businessId,
      name: 'OWNER',
      description: null,
      createdAt: new Date(),
      permissions: [],
    });

    const result = await service.getMyProfile(businessId, roleId, null);

    expect(result.role.description).toBeNull();
  });
});
