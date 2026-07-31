import { DashboardController } from './dashboard.controller';
import { DashboardService } from '../services/dashboard.service';

describe('DashboardController', () => {
  let service: jest.Mocked<Pick<DashboardService, 'getSummary'>>;
  let controller: DashboardController;

  beforeEach(() => {
    service = { getSummary: jest.fn() };
    controller = new DashboardController(
      service as unknown as DashboardService,
    );
  });

  it('getSummary() forwards the optional branch filter', async () => {
    service.getSummary.mockResolvedValue({} as never);
    await controller.getSummary('business-1', { branchId: 'branch-1' });
    expect(service.getSummary).toHaveBeenCalledWith('business-1', 'branch-1');
  });
});
