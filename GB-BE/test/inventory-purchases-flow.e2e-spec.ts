import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';

interface EnvelopeBody<T> {
  success: boolean;
  data: T;
}

interface LoginData {
  accessToken: string;
  user: { businessId: string; branchId: string };
}

const ADMIN_EMAIL = 'admin@goldenbites.local';
const ADMIN_PASSWORD = 'ChangeMe123!';
const RUN_ID = Date.now();

describe('Inventory & Purchases flow (e2e)', () => {
  let app: INestApplication<App>;
  let adminToken: string;
  let branchId: string;
  let locationId: string;
  let location2Id: string;
  let supplierId: string;
  let itemId: string;
  let transferId: string;
  let countId: string;
  let purchaseOrderId: string;
  let purchaseOrderItemId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api/v1');
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        transformOptions: { enableImplicitConversion: true },
      }),
    );
    await app.init();

    const loginRes = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD })
      .expect(201);
    const loginData = (loginRes.body as EnvelopeBody<LoginData>).data;
    adminToken = loginData.accessToken;
    branchId = loginData.user.branchId;
  });

  afterAll(async () => {
    await app.close();
  });

  function auth() {
    return { Authorization: `Bearer ${adminToken}` };
  }

  it('creates a supplier and an inventory item', async () => {
    const supplierRes = await request(app.getHttpServer())
      .post('/api/v1/suppliers')
      .set(auth())
      .send({ name: `E2E Supplier ${RUN_ID}` })
      .expect(201);
    supplierId = (supplierRes.body as EnvelopeBody<{ id: string }>).data.id;

    const itemRes = await request(app.getHttpServer())
      .post('/api/v1/inventory-items')
      .set(auth())
      .send({ name: `E2E Flour ${RUN_ID}`, unit: 'kg', minimumStock: 5 })
      .expect(201);
    itemId = (itemRes.body as EnvelopeBody<{ id: string }>).data.id;

    expect(supplierId).toEqual(expect.any(String));
    expect(itemId).toEqual(expect.any(String));
  });

  it('creates two storage locations in the branch', async () => {
    const loc1 = await request(app.getHttpServer())
      .post(`/api/v1/branches/${branchId}/inventory-locations`)
      .set(auth())
      .send({ name: `E2E Main Storage ${RUN_ID}` })
      .expect(201);
    locationId = (loc1.body as EnvelopeBody<{ id: string }>).data.id;

    const loc2 = await request(app.getHttpServer())
      .post(`/api/v1/branches/${branchId}/inventory-locations`)
      .set(auth())
      .send({ name: `E2E Secondary Storage ${RUN_ID}` })
      .expect(201);
    location2Id = (loc2.body as EnvelopeBody<{ id: string }>).data.id;
  });

  it('records an initial stock adjustment and reflects it in the stock query and kardex', async () => {
    await request(app.getHttpServer())
      .post('/api/v1/inventory/adjustments')
      .set(auth())
      .send({
        branchId,
        locationId,
        inventoryItemId: itemId,
        direction: 'IN',
        quantity: 100,
        reason: 'E2E initial stock',
      })
      .expect(201);

    const stockRes = await request(app.getHttpServer())
      .get(
        `/api/v1/inventory/stock?branchId=${branchId}&inventoryItemId=${itemId}`,
      )
      .set(auth())
      .expect(200);
    const stock = (stockRes.body as EnvelopeBody<{ stock: number }[]>).data;
    expect(stock[0].stock).toBe(100);

    const kardexRes = await request(app.getHttpServer())
      .get(`/api/v1/inventory/movements?inventoryItemId=${itemId}`)
      .set(auth())
      .expect(200);
    expect((kardexRes.body as EnvelopeBody<unknown[]>).data).toHaveLength(1);
  });

  it('rejects an outbound adjustment exceeding available stock', async () => {
    await request(app.getHttpServer())
      .post('/api/v1/inventory/adjustments')
      .set(auth())
      .send({
        branchId,
        locationId,
        inventoryItemId: itemId,
        direction: 'OUT',
        quantity: 999999,
        reason: 'Should fail',
      })
      .expect(422)
      .expect((res) => {
        expect((res.body as { code: string }).code).toBe('INSUFFICIENT_STOCK');
      });
  });

  it('creates and completes a transfer between locations', async () => {
    const createRes = await request(app.getHttpServer())
      .post('/api/v1/inventory/transfers')
      .set(auth())
      .send({
        fromBranchId: branchId,
        fromLocationId: locationId,
        toBranchId: branchId,
        toLocationId: location2Id,
        items: [{ inventoryItemId: itemId, quantity: 20 }],
      })
      .expect(201);
    transferId = (
      createRes.body as EnvelopeBody<{ id: string; status: string }>
    ).data.id;

    const completeRes = await request(app.getHttpServer())
      .post(`/api/v1/inventory/transfers/${transferId}/complete`)
      .set(auth())
      .expect(201);
    expect(
      (completeRes.body as EnvelopeBody<{ status: string }>).data.status,
    ).toBe('COMPLETED');

    const stockRes = await request(app.getHttpServer())
      .get(
        `/api/v1/inventory/stock?branchId=${branchId}&locationId=${location2Id}&inventoryItemId=${itemId}`,
      )
      .set(auth())
      .expect(200);
    expect(
      (stockRes.body as EnvelopeBody<{ stock: number }[]>).data[0].stock,
    ).toBe(20);
  });

  it('starts, records, and completes a physical count that posts an adjustment for the discrepancy', async () => {
    const startRes = await request(app.getHttpServer())
      .post('/api/v1/inventory/counts')
      .set(auth())
      .send({ branchId, locationId, inventoryItemIds: [itemId] })
      .expect(201);
    const startBody = (
      startRes.body as EnvelopeBody<{
        id: string;
        items: { expectedQuantity: number }[];
      }>
    ).data;
    countId = startBody.id;
    expect(startBody.items[0].expectedQuantity).toBe(100);

    await request(app.getHttpServer())
      .put(`/api/v1/inventory/counts/${countId}/items`)
      .set(auth())
      .send({ inventoryItemId: itemId, countedQuantity: 75 })
      .expect(200);

    const completeRes = await request(app.getHttpServer())
      .post(`/api/v1/inventory/counts/${countId}/complete`)
      .set(auth())
      .expect(201);
    expect(
      (completeRes.body as EnvelopeBody<{ status: string }>).data.status,
    ).toBe('COMPLETED');

    const stockRes = await request(app.getHttpServer())
      .get(
        `/api/v1/inventory/stock?branchId=${branchId}&locationId=${locationId}&inventoryItemId=${itemId}`,
      )
      .set(auth())
      .expect(200);
    expect(
      (stockRes.body as EnvelopeBody<{ stock: number }[]>).data[0].stock,
    ).toBe(55);
  });

  it('creates, submits, and approves a purchase order', async () => {
    const createRes = await request(app.getHttpServer())
      .post('/api/v1/purchase-orders')
      .set(auth())
      .send({
        branchId,
        supplierId,
        items: [{ inventoryItemId: itemId, quantity: 50, unitCost: 2.5 }],
      })
      .expect(201);
    const created = (
      createRes.body as EnvelopeBody<{
        id: string;
        orderNumber: string;
        status: string;
        items: { id: string }[];
      }>
    ).data;
    purchaseOrderId = created.id;
    purchaseOrderItemId = created.items[0].id;
    expect(created.orderNumber).toMatch(/^PO-\d{6}$/);
    expect(created.status).toBe('DRAFT');

    await request(app.getHttpServer())
      .post(`/api/v1/purchase-orders/${purchaseOrderId}/submit`)
      .set(auth())
      .expect(201);

    const approveRes = await request(app.getHttpServer())
      .post(`/api/v1/purchase-orders/${purchaseOrderId}/approve`)
      .set(auth())
      .expect(201);
    expect(
      (approveRes.body as EnvelopeBody<{ status: string }>).data.status,
    ).toBe('APPROVED');
  });

  it('receives goods partially, then fully, syncing PO status and item cost', async () => {
    const partialRes = await request(app.getHttpServer())
      .post('/api/v1/goods-receipts')
      .set(auth())
      .send({
        purchaseOrderId,
        items: [{ purchaseOrderItemId, quantityReceived: 20, unitCost: 2.75 }],
      })
      .expect(201);
    expect((partialRes.body as EnvelopeBody<{ id: string }>).data.id).toEqual(
      expect.any(String),
    );

    const poAfterPartial = await request(app.getHttpServer())
      .get(`/api/v1/purchase-orders/${purchaseOrderId}`)
      .set(auth())
      .expect(200);
    const partialBody = (
      poAfterPartial.body as EnvelopeBody<{
        status: string;
        items: { receivedQuantity: number }[];
      }>
    ).data;
    expect(partialBody.status).toBe('PARTIALLY_RECEIVED');
    expect(partialBody.items[0].receivedQuantity).toBe(20);

    const itemAfterPartial = await request(app.getHttpServer())
      .get(`/api/v1/inventory-items/${itemId}`)
      .set(auth())
      .expect(200);
    expect(
      (itemAfterPartial.body as EnvelopeBody<{ currentCost: number }>).data
        .currentCost,
    ).toBe(2.75);

    await request(app.getHttpServer())
      .post('/api/v1/goods-receipts')
      .set(auth())
      .send({
        purchaseOrderId,
        items: [{ purchaseOrderItemId, quantityReceived: 30, unitCost: 3 }],
      })
      .expect(201);

    const poAfterFull = await request(app.getHttpServer())
      .get(`/api/v1/purchase-orders/${purchaseOrderId}`)
      .set(auth())
      .expect(200);
    const fullBody = (
      poAfterFull.body as EnvelopeBody<{
        status: string;
        items: { receivedQuantity: number }[];
      }>
    ).data;
    expect(fullBody.status).toBe('RECEIVED');
    expect(fullBody.items[0].receivedQuantity).toBe(50);

    const itemAfterFull = await request(app.getHttpServer())
      .get(`/api/v1/inventory-items/${itemId}`)
      .set(auth())
      .expect(200);
    expect(
      (itemAfterFull.body as EnvelopeBody<{ currentCost: number }>).data
        .currentCost,
    ).toBe(3);
  });

  it('rejects over-receiving once the order is fully received', async () => {
    await request(app.getHttpServer())
      .post('/api/v1/goods-receipts')
      .set(auth())
      .send({
        purchaseOrderId,
        items: [{ purchaseOrderItemId, quantityReceived: 1, unitCost: 3 }],
      })
      .expect(422)
      .expect((res) => {
        expect((res.body as { code: string }).code).toBe('PO_NOT_RECEIVABLE');
      });
  });

  it('cleans up the data created by this suite', async () => {
    await request(app.getHttpServer())
      .delete(`/api/v1/inventory-items/${itemId}`)
      .set(auth())
      .expect(204);

    await request(app.getHttpServer())
      .patch(`/api/v1/suppliers/${supplierId}/status`)
      .set(auth())
      .send({ isActive: false })
      .expect(200);

    await request(app.getHttpServer())
      .patch(
        `/api/v1/branches/${branchId}/inventory-locations/${locationId}/status`,
      )
      .set(auth())
      .send({ isActive: false })
      .expect(200);

    await request(app.getHttpServer())
      .patch(
        `/api/v1/branches/${branchId}/inventory-locations/${location2Id}/status`,
      )
      .set(auth())
      .send({ isActive: false })
      .expect(200);
  });
});
