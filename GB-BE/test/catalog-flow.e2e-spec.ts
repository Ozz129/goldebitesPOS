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
}

const ADMIN_EMAIL = 'admin@goldenbites.local';
const ADMIN_PASSWORD = 'ChangeMe123!';
const RUN_ID = Date.now();

describe('Catalog flow (e2e)', () => {
  let app: INestApplication<App>;
  let adminToken: string;
  let categoryId: string;
  let bunId: string;
  let beefId: string;
  let productId: string;

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
    adminToken = (loginRes.body as EnvelopeBody<LoginData>).data.accessToken;
  });

  afterAll(async () => {
    await app.close();
  });

  function auth() {
    return { Authorization: `Bearer ${adminToken}` };
  }

  it('creates a product category', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/v1/product-categories')
      .set(auth())
      .send({ name: `E2E Category ${RUN_ID}` })
      .expect(201);

    categoryId = (res.body as EnvelopeBody<{ id: string }>).data.id;
    expect(categoryId).toEqual(expect.any(String));
  });

  it('rejects a duplicate category name with 409', async () => {
    await request(app.getHttpServer())
      .post('/api/v1/product-categories')
      .set(auth())
      .send({ name: `E2E Category ${RUN_ID}` })
      .expect(409);
  });

  it('creates inventory items with decimal cost (regression for the COALESCE numeric bug)', async () => {
    const bunRes = await request(app.getHttpServer())
      .post('/api/v1/inventory-items')
      .set(auth())
      .send({
        name: `E2E Bun ${RUN_ID}`,
        unit: 'unit',
        currentCost: 0.8,
        minimumStock: 20,
      })
      .expect(201);
    bunId = (bunRes.body as EnvelopeBody<{ id: string }>).data.id;

    const beefRes = await request(app.getHttpServer())
      .post('/api/v1/inventory-items')
      .set(auth())
      .send({ name: `E2E Beef ${RUN_ID}`, unit: 'kg', currentCost: 18.5 })
      .expect(201);
    beefId = (beefRes.body as EnvelopeBody<{ id: string }>).data.id;

    expect(bunId).toEqual(expect.any(String));
    expect(beefId).toEqual(expect.any(String));
  });

  it('creates a product with a decimal sale price, scoped to the category', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/v1/products')
      .set(auth())
      .send({ name: `E2E Burger ${RUN_ID}`, categoryId, salePrice: 25000.5 })
      .expect(201);

    const body = (
      res.body as EnvelopeBody<{
        id: string;
        salePrice: number;
        currentCost: number;
      }>
    ).data;
    productId = body.id;
    expect(body.salePrice).toBe(25000.5);
    expect(body.currentCost).toBe(0);
  });

  it('creates a recipe with items and syncs the product cost', async () => {
    const res = await request(app.getHttpServer())
      .post(`/api/v1/products/${productId}/recipe`)
      .set(auth())
      .send({
        yieldQuantity: 1,
        items: [
          { inventoryItemId: bunId, quantity: 1 },
          { inventoryItemId: beefId, quantity: 0.15 },
        ],
      })
      .expect(201);

    const body = (
      res.body as EnvelopeBody<{
        items: unknown[];
        cost: { totalCost: number; costPerPortion: number };
      }>
    ).data;
    expect(body.items).toHaveLength(2);
    expect(body.cost.totalCost).toBeCloseTo(3.58, 2);
    expect(body.cost.costPerPortion).toBeCloseTo(3.58, 2);
  });

  it('reflects the recipe cost in the product margin', async () => {
    const res = await request(app.getHttpServer())
      .get(`/api/v1/products/${productId}/margin`)
      .set(auth())
      .expect(200);

    const body = (
      res.body as EnvelopeBody<{ currentCost: number; marginAmount: number }>
    ).data;
    expect(body.currentCost).toBeCloseTo(3.58, 2);
    expect(body.marginAmount).toBeCloseTo(24996.92, 2);
  });

  it('rejects creating a second recipe for the same product with 409', async () => {
    await request(app.getHttpServer())
      .post(`/api/v1/products/${productId}/recipe`)
      .set(auth())
      .send({ yieldQuantity: 1 })
      .expect(409);
  });

  it('lists the product among those available for sale', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/v1/products/available')
      .set(auth())
      .expect(200);

    const body = (res.body as EnvelopeBody<{ id: string }[]>).data;
    expect(body.some((p) => p.id === productId)).toBe(true);
  });

  it('deactivating the product removes it from the available-for-sale list', async () => {
    await request(app.getHttpServer())
      .patch(`/api/v1/products/${productId}/status`)
      .set(auth())
      .send({ isActive: false })
      .expect(200);

    const res = await request(app.getHttpServer())
      .get('/api/v1/products/available')
      .set(auth())
      .expect(200);

    const body = (res.body as EnvelopeBody<{ id: string }[]>).data;
    expect(body.some((p) => p.id === productId)).toBe(false);
  });

  it('creates and manages a supplier', async () => {
    const createRes = await request(app.getHttpServer())
      .post('/api/v1/suppliers')
      .set(auth())
      .send({ name: `E2E Supplier ${RUN_ID}`, taxId: '900123456-7' })
      .expect(201);

    const supplierId = (createRes.body as EnvelopeBody<{ id: string }>).data.id;

    await request(app.getHttpServer())
      .patch(`/api/v1/suppliers/${supplierId}/status`)
      .set(auth())
      .send({ isActive: false })
      .expect(200);

    await request(app.getHttpServer())
      .get(`/api/v1/suppliers/${supplierId}`)
      .set(auth())
      .expect(200)
      .expect((res) => {
        const body = (res.body as EnvelopeBody<{ isActive: boolean }>).data;
        expect(body.isActive).toBe(false);
      });
  });

  it('cleans up the data created by this suite', async () => {
    await request(app.getHttpServer())
      .delete(`/api/v1/products/${productId}/recipe`)
      .set(auth())
      .expect(204);

    await request(app.getHttpServer())
      .delete(`/api/v1/products/${productId}`)
      .set(auth())
      .expect(204);

    await request(app.getHttpServer())
      .delete(`/api/v1/inventory-items/${bunId}`)
      .set(auth())
      .expect(204);

    await request(app.getHttpServer())
      .delete(`/api/v1/inventory-items/${beefId}`)
      .set(auth())
      .expect(204);

    await request(app.getHttpServer())
      .patch(`/api/v1/product-categories/${categoryId}/status`)
      .set(auth())
      .send({ isActive: false })
      .expect(200);
  });
});
