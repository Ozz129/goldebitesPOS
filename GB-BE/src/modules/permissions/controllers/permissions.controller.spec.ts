import { PermissionsController } from './permissions.controller';
import { PermissionsService } from '../services/permissions.service';

describe('PermissionsController', () => {
  it('findAll() delegates to the service', async () => {
    const service = {
      findAll: jest.fn().mockResolvedValue([{ code: 'orders.read' }]),
    };
    const controller = new PermissionsController(
      service as unknown as PermissionsService,
    );

    const result = await controller.findAll();

    expect(service.findAll).toHaveBeenCalled();
    expect(result).toEqual([{ code: 'orders.read' }]);
  });
});
