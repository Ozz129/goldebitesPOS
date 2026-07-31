import { EntityNotFoundException } from '../../../common/exceptions';
import { CustomerRow } from '../domain/customer.interface';
import { CustomersService } from './customers.service';

describe('CustomersService', () => {
  let repository: {
    create: jest.Mock;
    findById: jest.Mock;
    findAll: jest.Mock;
    update: jest.Mock;
    softDelete: jest.Mock;
    incrementStats: jest.Mock;
    createAddress: jest.Mock;
    findAddresses: jest.Mock;
    deleteAddress: jest.Mock;
  };
  let transactionService: { execute: jest.Mock };
  let auditService: { record: jest.Mock };
  let service: CustomersService;

  const businessId = 'business-1';

  function makeRow(overrides: Partial<CustomerRow> = {}): CustomerRow {
    return {
      id: 'customer-1',
      business_id: businessId,
      first_name: 'Ana',
      last_name: null,
      email: null,
      phone: null,
      document_number: null,
      birth_date: null,
      notes: null,
      total_orders: 0,
      total_spent: '0.00',
      loyalty_points: 0,
      created_at: new Date(),
      updated_at: new Date(),
      deleted_at: null,
      ...overrides,
    };
  }

  beforeEach(() => {
    repository = {
      create: jest.fn(),
      findById: jest.fn(),
      findAll: jest.fn().mockResolvedValue({ rows: [], total: 0 }),
      update: jest.fn(),
      softDelete: jest.fn(),
      incrementStats: jest.fn(),
      createAddress: jest.fn(),
      findAddresses: jest.fn().mockResolvedValue([]),
      deleteAddress: jest.fn(),
    };
    transactionService = {
      execute: jest.fn((work: (client: unknown) => Promise<unknown>) =>
        work({}),
      ),
    };
    auditService = { record: jest.fn() };
    service = new CustomersService(
      repository,
      transactionService as never,
      auditService as never,
    );
  });

  describe('create', () => {
    it('parses total_spent into a number', async () => {
      repository.create.mockResolvedValue(makeRow({ total_spent: '150.50' }));

      const customer = await service.create({ businessId, firstName: 'Ana' });

      expect(customer.totalSpent).toBe(150.5);
    });
  });

  describe('update', () => {
    it('throws EntityNotFoundException when the customer does not exist', async () => {
      repository.findById.mockResolvedValue(null);

      await expect(
        service.update(businessId, 'missing', { firstName: 'X' }),
      ).rejects.toThrow(EntityNotFoundException);
    });
  });

  describe('softDelete', () => {
    it('throws EntityNotFoundException when nothing was deleted', async () => {
      repository.softDelete.mockResolvedValue(null);

      await expect(
        service.softDelete(businessId, 'customer-1'),
      ).rejects.toThrow(EntityNotFoundException);
    });
  });

  describe('recordCompletedOrder', () => {
    it('delegates to incrementStats with the client for transactional use', async () => {
      const client = {} as never;
      await service.recordCompletedOrder('customer-1', 25000, client);

      expect(repository.incrementStats).toHaveBeenCalledWith(
        'customer-1',
        25000,
        client,
      );
    });
  });

  describe('addAddress', () => {
    it('validates the customer belongs to the business first', async () => {
      repository.findById.mockResolvedValue(null);

      await expect(
        service.addAddress(businessId, 'missing', { address: 'Calle 1' }),
      ).rejects.toThrow(EntityNotFoundException);
      expect(repository.createAddress).not.toHaveBeenCalled();
    });
  });

  describe('removeAddress', () => {
    it('throws EntityNotFoundException when the address does not belong to the customer', async () => {
      repository.findById.mockResolvedValue(makeRow());
      repository.deleteAddress.mockResolvedValue(false);

      await expect(
        service.removeAddress(businessId, 'customer-1', 'addr-1'),
      ).rejects.toThrow(EntityNotFoundException);
    });
  });
});
