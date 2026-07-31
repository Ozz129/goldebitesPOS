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

describe('Reporting flow (e2e)', () => {
  let app: INestApplication<App>;
  let adminToken: string;
  let branchId: string;
  let categoryId: string;
  let productId: string;
  let orderId: string;

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

  it('creates and delivers an order to generate a completed sale', async () => {
    const categoryRes = await request(app.getHttpServer())
      .post('/api/v1/product-categories')
      .set(auth())
      .send({ name: `E2E Reporting Category ${RUN_ID}` })
      .expect(201);
    categoryId = (categoryRes.body as EnvelopeBody<{ id: string }>).data.id;

    const productRes = await request(app.getHttpServer())
      .post('/api/v1/products')
      .set(auth())
      .send({
        name: `E2E Reporting Product ${RUN_ID}`,
        categoryId,
        salePrice: 4000,
        trackInventory: false,
      })
      .expect(201);
    productId = (productRes.body as EnvelopeBody<{ id: string }>).data.id;

    const orderRes = await request(app.getHttpServer())
      .post('/api/v1/orders')
      .set(auth())
      .send({
        branchId,
        orderType: 'TAKEAWAY',
        items: [{ productId, quantity: 2 }],
      })
      .expect(201);
    orderId = (orderRes.body as EnvelopeBody<{ id: string }>).data.id;

    for (const status of ['CONFIRMED', 'PREPARING', 'READY']) {
      await request(app.getHttpServer())
        .patch(`/api/v1/orders/${orderId}/status`)
        .set(auth())
        .send({ status })
        .expect(200);
    }

    await request(app.getHttpServer())
      .post(`/api/v1/orders/${orderId}/payments`)
      .set(auth())
      .send({ paymentMethod: 'CARD', amount: 8000 })
      .expect(201);

    await request(app.getHttpServer())
      .patch(`/api/v1/orders/${orderId}/status`)
      .set(auth())
      .send({ status: 'DELIVERED' })
      .expect(200);
  });

  it('reflects the delivered order in the dashboard summary', async () => {
    const res = await request(app.getHttpServer())
      .get(`/api/v1/dashboard/summary?branchId=${branchId}`)
      .set(auth())
      .expect(200);

    const summary = (
      res.body as EnvelopeBody<{
        todaySales: { orderCount: number; totalAmount: number };
        cashSessionOpen: boolean | null;
      }>
    ).data;
    expect(summary.todaySales.orderCount).toBeGreaterThanOrEqual(1);
    expect(summary.todaySales.totalAmount).toBeGreaterThanOrEqual(8000);
    expect(summary.cashSessionOpen).not.toBeUndefined();
  });

  it('includes the sale in analytics/sales grouped by day', async () => {
    const today = new Date().toISOString().slice(0, 10);
    const res = await request(app.getHttpServer())
      .get(
        `/api/v1/analytics/sales?dateFrom=${today}T00:00:00.000Z&dateTo=${today}T23:59:59.000Z&branchId=${branchId}`,
      )
      .set(auth())
      .expect(200);

    const days = (
      res.body as EnvelopeBody<{ date: string; totalAmount: number }[]>
    ).data;
    const todayEntry = days.find((day) => day.date === today);
    expect(todayEntry).toBeDefined();
    expect(todayEntry?.totalAmount).toBeGreaterThanOrEqual(8000);
  });

  it('ranks the product in analytics/top-products', async () => {
    const today = new Date().toISOString().slice(0, 10);
    const res = await request(app.getHttpServer())
      .get(
        `/api/v1/analytics/top-products?dateFrom=${today}T00:00:00.000Z&dateTo=${today}T23:59:59.000Z&branchId=${branchId}&limit=10`,
      )
      .set(auth())
      .expect(200);

    const products = (
      res.body as EnvelopeBody<
        { productId: string; quantitySold: number; revenue: number }[]
      >
    ).data;
    const entry = products.find((product) => product.productId === productId);
    expect(entry).toBeDefined();
    expect(entry?.quantitySold).toBe(2);
    expect(entry?.revenue).toBe(8000);
  });

  it('rejects an inverted date range', async () => {
    await request(app.getHttpServer())
      .get('/api/v1/analytics/sales?dateFrom=2026-02-01&dateTo=2026-01-01')
      .set(auth())
      .expect(422)
      .expect((res) => {
        expect((res.body as { code: string }).code).toBe('INVALID_DATE_RANGE');
      });
  });

  it('cleans up the data created by this suite', async () => {
    await request(app.getHttpServer())
      .delete(`/api/v1/products/${productId}`)
      .set(auth())
      .expect(204);

    await request(app.getHttpServer())
      .patch(`/api/v1/product-categories/${categoryId}/status`)
      .set(auth())
      .send({ isActive: false })
      .expect(200);
  });
});
