import { AnalyticsController } from './analytics.controller';
import { AnalyticsService } from '../services/analytics.service';

describe('AnalyticsController', () => {
  let service: jest.Mocked<
    Pick<AnalyticsService, 'getSalesByDay' | 'getTopProducts'>
  >;
  let controller: AnalyticsController;

  beforeEach(() => {
    service = { getSalesByDay: jest.fn(), getTopProducts: jest.fn() };
    controller = new AnalyticsController(
      service as unknown as AnalyticsService,
    );
  });

  it('getSales() forwards the date range and branch filter', async () => {
    service.getSalesByDay.mockResolvedValue([]);
    await controller.getSales('business-1', {
      dateFrom: '2026-01-01',
      dateTo: '2026-01-31',
      branchId: 'branch-1',
    });
    expect(service.getSalesByDay).toHaveBeenCalledWith(
      'business-1',
      'branch-1',
      '2026-01-01',
      '2026-01-31',
    );
  });

  it('getTopProducts() forwards the limit', async () => {
    service.getTopProducts.mockResolvedValue([]);
    await controller.getTopProducts('business-1', {
      dateFrom: '2026-01-01',
      dateTo: '2026-01-31',
      branchId: 'branch-1',
      limit: 5,
    });
    expect(service.getTopProducts).toHaveBeenCalledWith(
      'business-1',
      'branch-1',
      '2026-01-01',
      '2026-01-31',
      5,
    );
  });
});
