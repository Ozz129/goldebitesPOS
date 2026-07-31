import { BusinessRuleException } from '../../../common/exceptions';
import { AnalyticsService } from './analytics.service';

describe('AnalyticsService', () => {
  let ordersService: { getSalesByDay: jest.Mock; getTopProducts: jest.Mock };
  let service: AnalyticsService;

  const businessId = 'business-1';
  const branchId = 'branch-1';

  beforeEach(() => {
    ordersService = {
      getSalesByDay: jest.fn().mockResolvedValue([]),
      getTopProducts: jest.fn().mockResolvedValue([]),
    };
    service = new AnalyticsService(ordersService as never);
  });

  describe('getSalesByDay', () => {
    it('rejects a range where dateFrom is after dateTo', async () => {
      await expect(
        service.getSalesByDay(businessId, branchId, '2026-02-01', '2026-01-01'),
      ).rejects.toThrow(BusinessRuleException);
      expect(ordersService.getSalesByDay).not.toHaveBeenCalled();
    });

    it('delegates to OrdersService for a valid range', async () => {
      await service.getSalesByDay(
        businessId,
        branchId,
        '2026-01-01',
        '2026-01-31',
      );
      expect(ordersService.getSalesByDay).toHaveBeenCalledWith(
        businessId,
        branchId,
        '2026-01-01',
        '2026-01-31',
      );
    });
  });

  describe('getTopProducts', () => {
    it('rejects a range where dateFrom is after dateTo', async () => {
      await expect(
        service.getTopProducts(
          businessId,
          branchId,
          '2026-02-01',
          '2026-01-01',
          10,
        ),
      ).rejects.toThrow(BusinessRuleException);
    });

    it('delegates to OrdersService with the limit', async () => {
      await service.getTopProducts(
        businessId,
        branchId,
        '2026-01-01',
        '2026-01-31',
        5,
      );
      expect(ordersService.getTopProducts).toHaveBeenCalledWith(
        businessId,
        branchId,
        '2026-01-01',
        '2026-01-31',
        5,
      );
    });
  });
});
