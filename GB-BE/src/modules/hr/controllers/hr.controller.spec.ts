import { HrController } from './hr.controller';
import { BranchRulesService } from '../services/branch-rules.service';
import { HrProfileService } from '../services/hr-profile.service';

describe('HrController', () => {
  let branchRulesService: jest.Mocked<Pick<BranchRulesService, 'findAllByBranch' | 'replaceAll'>>;
  let hrProfileService: jest.Mocked<Pick<HrProfileService, 'getMyProfile'>>;
  let controller: HrController;

  beforeEach(() => {
    branchRulesService = {
      findAllByBranch: jest.fn(),
      replaceAll: jest.fn(),
    };
    hrProfileService = {
      getMyProfile: jest.fn(),
    };
    controller = new HrController(
      branchRulesService as unknown as BranchRulesService,
      hrProfileService as unknown as HrProfileService,
    );
  });

  it('findAllByBranch() scopes to the current business and forwards the query', async () => {
    branchRulesService.findAllByBranch.mockResolvedValue([]);
    await controller.findAllByBranch('business-1', { branchId: 'branch-1' });
    expect(branchRulesService.findAllByBranch).toHaveBeenCalledWith('business-1', 'branch-1');
  });

  it('replaceAll() forwards business, branch, rules, and actor', async () => {
    branchRulesService.replaceAll.mockResolvedValue([]);
    const rules = [{ title: 'Uniforme', description: 'Camisa negra' }];
    await controller.replaceAll('business-1', 'user-1', { branchId: 'branch-1' }, { rules });
    expect(branchRulesService.replaceAll).toHaveBeenCalledWith('business-1', 'branch-1', rules, 'user-1');
  });

  it('getMyProfile() forwards business, roleId, and branchId from the JWT', async () => {
    hrProfileService.getMyProfile.mockResolvedValue({
      role: { name: 'CASHIER', description: null },
      branchRules: [],
    });
    await controller.getMyProfile('business-1', 'role-1', 'branch-1');
    expect(hrProfileService.getMyProfile).toHaveBeenCalledWith('business-1', 'role-1', 'branch-1');
  });

  it('getMyProfile() passes through a null branchId unchanged', async () => {
    hrProfileService.getMyProfile.mockResolvedValue({
      role: { name: 'OWNER', description: null },
      branchRules: [],
    });
    await controller.getMyProfile('business-1', 'role-1', null);
    expect(hrProfileService.getMyProfile).toHaveBeenCalledWith('business-1', 'role-1', null);
  });
});
