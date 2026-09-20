import { PublicNfcController } from './public-nfc.controller';
import { NfcTagsService } from '../services/nfc-tags.service';

describe('PublicNfcController', () => {
  let service: jest.Mocked<Pick<NfcTagsService, 'resolvePublic'>>;
  let controller: PublicNfcController;

  beforeEach(() => {
    service = { resolvePublic: jest.fn() };
    controller = new PublicNfcController(service as unknown as NfcTagsService);
  });

  it('resolve() forwards the token param', async () => {
    service.resolvePublic.mockResolvedValue({
      businessId: 'business-1',
      branchId: 'branch-1',
      businessName: 'Golden Bites',
      tableNumber: '1',
    });

    const result = await controller.resolve('some-token');

    expect(service.resolvePublic).toHaveBeenCalledWith('some-token');
    expect(result.tableNumber).toBe('1');
  });
});
