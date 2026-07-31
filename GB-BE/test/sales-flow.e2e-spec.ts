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

describe('Sales flow (e2e)', () => {
  let app: INestApplication<App>;
  let adminToken: string;
  let branchId: string;
  let customerId: string;
  let categoryId: string;
  let productId: string;
  let orderId: string;
  let cashSessionId: string;

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

  it('opens a cash session for the branch', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/v1/cash-sessions')
      .set(auth())
      .send({ branchId, openingAmount: 50000 })
      .expect(201);

    cashSessionId = (res.body as EnvelopeBody<{ id: string; status: string }>)
      .data.id;
    expect((res.body as EnvelopeBody<{ status: string }>).data.status).toBe(
      'OPEN',
    );
  });

  it('rejects opening a second session for the same branch', async () => {
    await request(app.getHttpServer())
      .post('/api/v1/cash-sessions')
      .set(auth())
      .send({ branchId, openingAmount: 0 })
      .expect(422)
      .expect((res) => {
        expect((res.body as { code: string }).code).toBe(
          'CASH_SESSION_ALREADY_OPEN',
        );
      });
  });

  it('creates a customer with a saved address', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/v1/customers')
      .set(auth())
      .send({
        firstName: 'Ana',
        lastName: `E2E ${RUN_ID}`,
        phone: `300${RUN_ID}`,
      })
      .expect(201);
    customerId = (res.body as EnvelopeBody<{ id: string }>).data.id;

    await request(app.getHttpServer())
      .post(`/api/v1/customers/${customerId}/addresses`)
      .set(auth())
      .send({ address: 'Calle Falsa 123', isDefault: true })
      .expect(201);
  });

  it('creates a category and a product that does not track inventory', async () => {
    const categoryRes = await request(app.getHttpServer())
      .post('/api/v1/product-categories')
      .set(auth())
      .send({ name: `E2E Sales Category ${RUN_ID}` })
      .expect(201);
    categoryId = (categoryRes.body as EnvelopeBody<{ id: string }>).data.id;

    const productRes = await request(app.getHttpServer())
      .post('/api/v1/products')
      .set(auth())
      .send({
        name: `E2E Soda ${RUN_ID}`,
        categoryId,
        salePrice: 5000,
        trackInventory: false,
      })
      .expect(201);
    productId = (productRes.body as EnvelopeBody<{ id: string }>).data.id;
  });

  it('creates an order and computes the total from quantity * unit price', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/v1/orders')
      .set(auth())
      .send({
        branchId,
        customerId,
        orderType: 'DINE_IN',
        tableNumber: '5',
        items: [{ productId, quantity: 2 }],
      })
      .expect(201);

    const order = (
      res.body as EnvelopeBody<{
        id: string;
        status: string;
        totalAmount: number;
      }>
    ).data;
    orderId = order.id;
    expect(order.status).toBe('PENDING');
    expect(order.totalAmount).toBe(10000);
  });

  it('walks the order through CONFIRMED -> PREPARING -> READY via kitchen', async () => {
    await request(app.getHttpServer())
      .patch(`/api/v1/orders/${orderId}/status`)
      .set(auth())
      .send({ status: 'CONFIRMED' })
      .expect(200);

    const queueRes = await request(app.getHttpServer())
      .get(`/api/v1/kitchen/orders?branchId=${branchId}`)
      .set(auth())
      .expect(200);
    const queue = (queueRes.body as EnvelopeBody<{ id: string }[]>).data;
    expect(queue.some((order) => order.id === orderId)).toBe(true);

    await request(app.getHttpServer())
      .patch(`/api/v1/kitchen/orders/${orderId}/status`)
      .set(auth())
      .send({ status: 'PREPARING' })
      .expect(200);

    await request(app.getHttpServer())
      .patch(`/api/v1/kitchen/orders/${orderId}/status`)
      .set(auth())
      .send({ status: 'READY' })
      .expect(200);
  });

  it('rejects the kitchen endpoint moving an order straight to DELIVERED', async () => {
    await request(app.getHttpServer())
      .patch(`/api/v1/kitchen/orders/${orderId}/status`)
      .set(auth())
      .send({ status: 'DELIVERED' })
      .expect(400);
  });

  it('pays the order in cash, tying the payment to the open cash session', async () => {
    const res = await request(app.getHttpServer())
      .post(`/api/v1/orders/${orderId}/payments`)
      .set(auth())
      .send({ paymentMethod: 'CASH', amount: 10000 })
      .expect(201);
    expect((res.body as EnvelopeBody<{ amount: number }>).data.amount).toBe(
      10000,
    );

    const orderRes = await request(app.getHttpServer())
      .get(`/api/v1/orders/${orderId}`)
      .set(auth())
      .expect(200);
    expect(
      (orderRes.body as EnvelopeBody<{ paymentStatus: string }>).data
        .paymentStatus,
    ).toBe('PAID');
  });

  it('rejects a second payment that would exceed the order total', async () => {
    await request(app.getHttpServer())
      .post(`/api/v1/orders/${orderId}/payments`)
      .set(auth())
      .send({ paymentMethod: 'CASH', amount: 1 })
      .expect(422)
      .expect((res) => {
        expect((res.body as { code: string }).code).toBe(
          'PAYMENT_EXCEEDS_ORDER_TOTAL',
        );
      });
  });

  it('delivers the order and updates the customer stats', async () => {
    await request(app.getHttpServer())
      .patch(`/api/v1/orders/${orderId}/status`)
      .set(auth())
      .send({ status: 'DELIVERED' })
      .expect(200);

    const customerRes = await request(app.getHttpServer())
      .get(`/api/v1/customers/${customerId}`)
      .set(auth())
      .expect(200);
    const customer = (
      customerRes.body as EnvelopeBody<{
        totalOrders: number;
        totalSpent: number;
      }>
    ).data;
    expect(customer.totalOrders).toBe(1);
    expect(customer.totalSpent).toBe(10000);
  });

  it('rejects an invalid status transition from a terminal state', async () => {
    await request(app.getHttpServer())
      .patch(`/api/v1/orders/${orderId}/status`)
      .set(auth())
      .send({ status: 'CONFIRMED' })
      .expect(422)
      .expect((res) => {
        expect((res.body as { code: string }).code).toBe(
          'ORDER_INVALID_STATUS_TRANSITION',
        );
      });
  });

  it('closes the cash session with a matching cash difference', async () => {
    const res = await request(app.getHttpServer())
      .post(`/api/v1/cash-sessions/${cashSessionId}/close`)
      .set(auth())
      .send({ actualClosingAmount: 60000 })
      .expect(201);

    const closed = (
      res.body as EnvelopeBody<{
        status: string;
        expectedClosingAmount: number;
        differenceAmount: number;
      }>
    ).data;
    expect(closed.status).toBe('CLOSED');
    expect(closed.expectedClosingAmount).toBe(60000);
    expect(closed.differenceAmount).toBe(0);
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

    await request(app.getHttpServer())
      .delete(`/api/v1/customers/${customerId}`)
      .set(auth())
      .expect(204);
  });
});
