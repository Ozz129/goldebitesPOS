import { EntityNotFoundException } from '../../../common/exceptions';
import { PlatformFeatureFlagsService } from './platform-feature-flags.service';

describe('PlatformFeatureFlagsService', () => {
  let repository: { findDisabledKeys: jest.Mock; setEnabled: jest.Mock };
  let service: PlatformFeatureFlagsService;

  beforeEach(() => {
    repository = { findDisabledKeys: jest.fn().mockResolvedValue([]), setEnabled: jest.fn() };
    service = new PlatformFeatureFlagsService(repository as never);
  });

  describe('getEnabledKeys', () => {
    it('returns every module and sub-feature key when nothing is disabled', async () => {
      const keys = await service.getEnabledKeys();
      expect(keys).toContain('inventory');
      expect(keys).toContain('inventory.specializedQueries');
    });

    it('excludes a sub-feature explicitly disabled globally, keeping its parent module', async () => {
      repository.findDisabledKeys.mockResolvedValue(['inventory.specializedQueries']);
      const keys = await service.getEnabledKeys();
      expect(keys).toContain('inventory');
      expect(keys).not.toContain('inventory.specializedQueries');
    });

    it('cascades: disabling the parent module globally excludes its sub-feature too, even though it was never touched directly', async () => {
      repository.findDisabledKeys.mockResolvedValue(['inventory']);
      const keys = await service.getEnabledKeys();
      expect(keys).not.toContain('inventory');
      expect(keys).not.toContain('inventory.specializedQueries');
    });
  });

  describe('getCatalog', () => {
    it('returns a flat list with moduleKey/moduleLabel back-references', async () => {
      const catalog = await service.getCatalog();
      const sub = catalog.find((f) => f.key === 'inventory.specializedQueries');
      expect(sub).toMatchObject({ moduleKey: 'inventory', moduleLabel: 'Inventario', enabled: true });
    });

    it('reflects cascade: a sub-feature shows enabled=false when its parent module is globally disabled', async () => {
      repository.findDisabledKeys.mockResolvedValue(['inventory']);
      const catalog = await service.getCatalog();

      const module = catalog.find((f) => f.key === 'inventory');
      const sub = catalog.find((f) => f.key === 'inventory.specializedQueries');
      expect(module?.enabled).toBe(false);
      expect(sub?.enabled).toBe(false);
    });
  });

  describe('setFlag', () => {
    it('delegates to the repository for a valid key', async () => {
      await service.setFlag('inventory.specializedQueries', false);
      expect(repository.setEnabled).toHaveBeenCalledWith('inventory.specializedQueries', false);
    });

    it('rejects an unknown key without touching the repository', async () => {
      await expect(service.setFlag('inventory.bogus', false)).rejects.toThrow(EntityNotFoundException);
      expect(repository.setEnabled).not.toHaveBeenCalled();
    });
  });
});
