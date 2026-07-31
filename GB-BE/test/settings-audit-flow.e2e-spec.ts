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

describe('Settings & Audit flow (e2e)', () => {
  let app: INestApplication<App>;
  let adminToken: string;
  let branchId: string;
  let supplierId: string;
  let itemId: string;
  let purchaseOrderId: string;

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
    await request(app.getHttpServer())
      .patch('/api/v1/settings')
      .set(auth())
      .send({ taxRate: 0 });
    await app.close();
  });

  function auth() {
    return { Authorization: `Bearer ${adminToken}` };
  }

  it('defaults the tax rate to 0', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/v1/settings')
      .set(auth())
      .expect(200);
    expect((res.body as EnvelopeBody<{ taxRate: number }>).data.taxRate).toBe(
      0,
    );
  });

  it('rejects a tax rate outside [0, 1]', async () => {
    await request(app.getHttpServer())
      .patch('/api/v1/settings')
      .set(auth())
      .send({ taxRate: 1.5 })
      .expect(400);
  });

  it('updates the tax rate and applies it to a new purchase order', async () => {
    await request(app.getHttpServer())
      .patch('/api/v1/settings')
      .set(auth())
      .send({ taxRate: 0.19 })
      .expect(200)
      .expect((res) => {
        expect(
          (res.body as EnvelopeBody<{ taxRate: number }>).data.taxRate,
        ).toBe(0.19);
      });

    const supplierRes = await request(app.getHttpServer())
      .post('/api/v1/suppliers')
      .set(auth())
      .send({ name: `E2E Tax Supplier ${RUN_ID}` })
      .expect(201);
    supplierId = (supplierRes.body as EnvelopeBody<{ id: string }>).data.id;

    const itemRes = await request(app.getHttpServer())
      .post('/api/v1/inventory-items')
      .set(auth())
      .send({ name: `E2E Tax Item ${RUN_ID}`, unit: 'kg' })
      .expect(201);
    itemId = (itemRes.body as EnvelopeBody<{ id: string }>).data.id;

    const poRes = await request(app.getHttpServer())
      .post('/api/v1/purchase-orders')
      .set(auth())
      .send({
        branchId,
        supplierId,
        items: [{ inventoryItemId: itemId, quantity: 10, unitCost: 100 }],
      })
      .expect(201);
    const po = (
      poRes.body as EnvelopeBody<{
        id: string;
        subtotal: number;
        taxAmount: number;
        totalAmount: number;
      }>
    ).data;
    purchaseOrderId = po.id;
    expect(po.subtotal).toBe(1000);
    expect(po.taxAmount).toBe(190);
    expect(po.totalAmount).toBe(1190);
  });

  it('records the tax rate change in the audit trail', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/v1/audit-logs?action=UPDATE_TAX_RATE&limit=5')
      .set(auth())
      .expect(200);
    const entries = (res.body as EnvelopeBody<{ action: string }[]>).data;
    expect(entries.length).toBeGreaterThan(0);
    expect(entries.every((entry) => entry.action === 'UPDATE_TAX_RATE')).toBe(
      true,
    );
  });

  it('cleans up the data created by this suite', async () => {
    await request(app.getHttpServer())
      .post(`/api/v1/purchase-orders/${purchaseOrderId}/cancel`)
      .set(auth())
      .expect(201);

    await request(app.getHttpServer())
      .delete(`/api/v1/inventory-items/${itemId}`)
      .set(auth())
      .expect(204);

    await request(app.getHttpServer())
      .patch(`/api/v1/suppliers/${supplierId}/status`)
      .set(auth())
      .send({ isActive: false })
      .expect(200);
  });
});
