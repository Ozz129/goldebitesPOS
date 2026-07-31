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
  refreshToken: string;
  user: { id: string; roleName: string };
}

interface RoleSummary {
  id: string;
  name: string;
}

const ADMIN_EMAIL = 'admin@goldenbites.local';
const ADMIN_PASSWORD = 'ChangeMe123!';
const RUN_ID = Date.now();

describe('Auth flow (e2e)', () => {
  let app: INestApplication<App>;
  let adminToken: string;
  let createdBranchId: string;
  let createdUserId: string;

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
  });

  afterAll(async () => {
    await app.close();
  });

  it('rejects invalid credentials with a standardized 401', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ email: ADMIN_EMAIL, password: 'wrong-password' })
      .expect(401);

    expect(res.body).toEqual(
      expect.objectContaining({ statusCode: 401, code: 'UNAUTHORIZED' }),
    );
  });

  it('rejects protected routes without a token', async () => {
    await request(app.getHttpServer()).get('/api/v1/users/me').expect(401);
  });

  it('logs the seeded admin in and returns tokens + profile', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD })
      .expect(201);

    const body = res.body as EnvelopeBody<LoginData>;
    expect(body.success).toBe(true);
    expect(body.data.accessToken).toEqual(expect.any(String));
    expect(body.data.refreshToken).toEqual(expect.any(String));
    expect(body.data.user.roleName).toBe('SUPER_ADMIN');

    adminToken = body.data.accessToken;
  });

  it("returns the admin's own profile on GET /users/me", async () => {
    const res = await request(app.getHttpServer())
      .get('/api/v1/users/me')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);

    const body = res.body as EnvelopeBody<{ email: string }>;
    expect(body.data.email).toBe(ADMIN_EMAIL);
  });

  it('creates a branch scoped to the current business', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/v1/branches')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: `E2E Branch ${RUN_ID}` })
      .expect(201);

    const body = res.body as EnvelopeBody<{ id: string; name: string }>;
    expect(body.data.name).toBe(`E2E Branch ${RUN_ID}`);
    createdBranchId = body.data.id;
  });

  it('rejects a duplicate branch name in the same business with 409', async () => {
    await request(app.getHttpServer())
      .post('/api/v1/branches')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: `E2E Branch ${RUN_ID}` })
      .expect(409);
  });

  it('creates a CASHIER user and confirms their permission set is restricted', async () => {
    const rolesRes = await request(app.getHttpServer())
      .get('/api/v1/roles')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);

    const roles = (rolesRes.body as EnvelopeBody<RoleSummary[]>).data;
    const cashierRole = roles.find((role) => role.name === 'CASHIER');
    expect(cashierRole).toBeDefined();

    const email = `e2e-cashier-${RUN_ID}@goldenbites.local`;
    const createRes = await request(app.getHttpServer())
      .post('/api/v1/users')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        firstName: 'E2E',
        lastName: 'Cashier',
        email,
        password: 'CashierPass1',
        roleId: cashierRole?.id,
        branchId: createdBranchId,
      })
      .expect(201);

    createdUserId = (createRes.body as EnvelopeBody<{ id: string }>).data.id;

    const loginRes = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ email, password: 'CashierPass1' })
      .expect(201);

    const cashierToken = (loginRes.body as EnvelopeBody<LoginData>).data
      .accessToken;

    // CASHIER does not have roles.manage — must be forbidden.
    await request(app.getHttpServer())
      .get('/api/v1/roles')
      .set('Authorization', `Bearer ${cashierToken}`)
      .expect(403);

    // But CASHIER does have orders.read-adjacent dashboard access via users.manage? No —
    // confirm they CAN read their own profile (no special permission required).
    await request(app.getHttpServer())
      .get('/api/v1/users/me')
      .set('Authorization', `Bearer ${cashierToken}`)
      .expect(200);
  });

  it('supports refresh token rotation', async () => {
    const loginRes = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD })
      .expect(201);

    const { refreshToken } = (loginRes.body as EnvelopeBody<LoginData>).data;

    const refreshRes = await request(app.getHttpServer())
      .post('/api/v1/auth/refresh')
      .send({ refreshToken })
      .expect(201);

    const refreshed = (refreshRes.body as EnvelopeBody<LoginData>).data;
    expect(refreshed.accessToken).toEqual(expect.any(String));
    expect(refreshed.refreshToken).not.toBe(refreshToken);

    // The rotated-out token must now be rejected.
    await request(app.getHttpServer())
      .post('/api/v1/auth/refresh')
      .send({ refreshToken })
      .expect(401);
  });

  it('cleans up the data created by this suite', async () => {
    await request(app.getHttpServer())
      .delete(`/api/v1/users/${createdUserId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(204);

    await request(app.getHttpServer())
      .patch(`/api/v1/branches/${createdBranchId}/status`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ isActive: false })
      .expect(200);
  });
});
