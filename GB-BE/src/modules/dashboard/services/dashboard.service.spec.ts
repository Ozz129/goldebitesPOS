import { DashboardService } from './dashboard.service';

describe('DashboardService', () => {
  let ordersService: { getSalesSummary: jest.Mock; getActiveCount: jest.Mock };
  let movementsService: { getLowStockAlerts: jest.Mock };
  let cashSessionsService: { hasOpenSession: jest.Mock };
  let service: DashboardService;

  const businessId = 'business-1';
  const branchId = 'branch-1';

  beforeEach(() => {
    ordersService = {
      getSalesSummary: jest
        .fn()
        .mockResolvedValue({ orderCount: 0, totalAmount: 0 }),
      getActiveCount: jest.fn().mockResolvedValue(0),
    };
    movementsService = { getLowStockAlerts: jest.fn().mockResolvedValue([]) };
    cashSessionsService = { hasOpenSession: jest.fn().mockResolvedValue(true) };
    service = new DashboardService(
      ordersService as never,
      movementsService as never,
      cashSessionsService as never,
    );
  });

  it('computes averageTicket from totalAmount / orderCount', async () => {
    ordersService.getSalesSummary.mockResolvedValue({
      orderCount: 3,
      totalAmount: 30000,
    });

    const summary = await service.getSummary(businessId, branchId);

    expect(summary.todaySales).toEqual({
      orderCount: 3,
      totalAmount: 30000,
      averageTicket: 10000,
    });
  });

  it('averageTicket is 0 when there are no sales (avoids division by zero)', async () => {
    const summary = await service.getSummary(businessId, branchId);
    expect(summary.todaySales.averageTicket).toBe(0);
  });

  it('reports lowStockCount from the alert list length', async () => {
    movementsService.getLowStockAlerts.mockResolvedValue([{}, {}]);

    const summary = await service.getSummary(businessId, branchId);
    expect(summary.lowStockCount).toBe(2);
  });

  it('skips the cash session check when no branch is given (null, not false)', async () => {
    const summary = await service.getSummary(businessId);

    expect(cashSessionsService.hasOpenSession).not.toHaveBeenCalled();
    expect(summary.cashSessionOpen).toBeNull();
  });

  it('reports cashSessionOpen when a branch is given', async () => {
    cashSessionsService.hasOpenSession.mockResolvedValue(false);

    const summary = await service.getSummary(businessId, branchId);

    expect(cashSessionsService.hasOpenSession).toHaveBeenCalledWith(
      businessId,
      branchId,
    );
    expect(summary.cashSessionOpen).toBe(false);
  });
});
