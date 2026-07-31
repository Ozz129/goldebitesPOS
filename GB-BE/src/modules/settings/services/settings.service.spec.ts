import { SettingsService } from './settings.service';

describe('SettingsService', () => {
  let businessesService: { findById: jest.Mock; updateTaxRate: jest.Mock };
  let service: SettingsService;

  beforeEach(() => {
    businessesService = {
      findById: jest
        .fn()
        .mockResolvedValue({ id: 'business-1', taxRate: 0.19 }),
      updateTaxRate: jest
        .fn()
        .mockResolvedValue({ id: 'business-1', taxRate: 0.1 }),
    };
    service = new SettingsService(businessesService as never);
  });

  it('get() returns the business tax rate', async () => {
    const settings = await service.get('business-1');
    expect(settings).toEqual({ taxRate: 0.19 });
  });

  it('update() delegates to BusinessesService.updateTaxRate and returns the new value', async () => {
    const settings = await service.update('business-1', 0.1, 'actor-1');

    expect(businessesService.updateTaxRate).toHaveBeenCalledWith(
      'business-1',
      0.1,
      'actor-1',
    );
    expect(settings).toEqual({ taxRate: 0.1 });
  });
});
