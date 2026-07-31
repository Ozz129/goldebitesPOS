import {
  ConflictException,
  EntityNotFoundException,
} from '../../../common/exceptions';
import { BranchRow } from '../domain/branch.interface';
import { BranchesService } from './branches.service';

describe('BranchesService', () => {
  let branchesRepository: {
    create: jest.Mock;
    findById: jest.Mock;
    findAll: jest.Mock;
    update: jest.Mock;
    setActive: jest.Mock;
    existsByName: jest.Mock;
  };
  let auditService: { record: jest.Mock };
  let service: BranchesService;

  const businessId = 'business-1';

  function makeBranchRow(overrides: Partial<BranchRow> = {}): BranchRow {
    return {
      id: 'branch-1',
      business_id: businessId,
      name: 'Sede Principal',
      address: null,
      city: null,
      phone: null,
      is_active: true,
      created_at: new Date(),
      updated_at: new Date(),
      ...overrides,
    };
  }

  beforeEach(() => {
    branchesRepository = {
      create: jest.fn(),
      findById: jest.fn(),
      findAll: jest.fn(),
      update: jest.fn(),
      setActive: jest.fn(),
      existsByName: jest.fn(),
    };
    auditService = { record: jest.fn() };
    service = new BranchesService(branchesRepository, auditService as never);
  });

  describe('create', () => {
    it('creates a branch when the name is free within the business', async () => {
      branchesRepository.existsByName.mockResolvedValue(false);
      branchesRepository.create.mockResolvedValue(makeBranchRow());

      const branch = await service.create({
        businessId,
        name: 'Sede Principal',
      });

      expect(branch.name).toBe('Sede Principal');
    });

    it('rejects a duplicate branch name within the same business', async () => {
      branchesRepository.existsByName.mockResolvedValue(true);

      await expect(
        service.create({ businessId, name: 'Sede Principal' }),
      ).rejects.toThrow(ConflictException);
      expect(branchesRepository.create).not.toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('returns a paginated result built from the repository total', async () => {
      branchesRepository.findAll.mockResolvedValue({
        rows: [makeBranchRow()],
        total: 1,
      });

      const result = await service.findAll({ businessId, page: 1, limit: 20 });

      expect(result.data).toHaveLength(1);
      expect(result.meta).toEqual(
        expect.objectContaining({
          total: 1,
          page: 1,
          limit: 20,
          totalPages: 1,
        }),
      );
    });
  });

  describe('setActive', () => {
    it('throws EntityNotFoundException when the branch is not owned by the business', async () => {
      branchesRepository.findById.mockResolvedValue(null);

      await expect(
        service.setActive(businessId, 'branch-1', false),
      ).rejects.toThrow(EntityNotFoundException);
    });
  });
});
