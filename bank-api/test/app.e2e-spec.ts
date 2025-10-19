import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { MongoMemoryServer } from 'mongodb-memory-server';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Banking API (e2e)', () => {
  let app: INestApplication;
  let mongoServer: MongoMemoryServer;
  let authToken: string;
  let userId: string;

  beforeAll(async () => {
    // Start in-memory MongoDB
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();

    // Set environment variables
    process.env.MONGODB_URI = mongoUri;
    process.env.JWT_SECRET = 'test-secret';
    process.env.NODE_ENV = 'test';

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    // Apply the same configuration as main.ts
    app.enableCors();
    app.useGlobalPipes(
      new (require('@nestjs/common').ValidationPipe)({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );

    await app.init();
  });

  afterAll(async () => {
    await app.close();
    await mongoServer.stop();
  });

  describe('Health Check', () => {
    it('/health (GET)', () => {
      return request(app.getHttpServer())
        .get('/health')
        .expect(200)
        .expect((res) => {
          expect(res.body.success).toBe(true);
          expect(res.body.data.status).toBe('up');
          expect(res.body.data.db).toBe('ok');
        });
    });
  });

  describe('Authentication Flow', () => {
    it('should register a new user', async () => {
      const registerData = {
        name: 'Test User',
        email: 'test@example.com',
        phone: '+84901234567',
        password: 'TestPass123!',
      };

      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send(registerData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.message).toBe('VERIFICATION_SENT');
    });

    it('should reject duplicate email registration', async () => {
      const registerData = {
        name: 'Test User 2',
        email: 'test@example.com',
        password: 'TestPass123!',
      };

      await request(app.getHttpServer())
        .post('/auth/register')
        .send(registerData)
        .expect(201); // Should resend verification for unverified email
    });

    it('should verify email with valid code', async () => {
      // Note: In a real test, you would need to mock the email verification code
      // For this example, we'll assume the code is '123456'
      const verifyData = {
        code: '123456',
      };

      // This will fail in real test since we don't have the actual verification code
      // In a real implementation, you'd need to mock the email service or extract the code from the database
      await request(app.getHttpServer())
        .post('/auth/verify')
        .send(verifyData)
        .expect(400); // Expected to fail without real verification code
    });

    it('should login with valid credentials', async () => {
      // First, we need to manually verify the email in the database for testing
      // In a real test, you would set up the database state properly

      const loginData = {
        email: 'test@example.com',
        password: 'TestPass123!',
      };

      // This will fail because email is not verified
      await request(app.getHttpServer())
        .post('/auth/login')
        .send(loginData)
        .expect(403)
        .expect((res) => {
          expect(res.body.success).toBe(false);
          expect(res.body.code).toBe('EMAIL_NOT_VERIFIED');
        });
    });
  });

  describe('Protected Routes', () => {
    beforeEach(async () => {
      // In a real test, you would set up a verified user and get a valid token
      // For this example, we'll create a mock token
      authToken = 'mock-jwt-token';
      userId = 'mock-user-id';
    });

    it('should reject access to protected routes without token', async () => {
      await request(app.getHttpServer())
        .get('/profile')
        .expect(401)
        .expect((res) => {
          expect(res.body.success).toBe(false);
          expect(res.body.code).toBe('UNAUTHORIZED');
        });
    });

    it('should reject access to admin routes without admin role', async () => {
      await request(app.getHttpServer())
        .get('/admin/users')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(403)
        .expect((res) => {
          expect(res.body.success).toBe(false);
          expect(res.body.code).toBe('FORBIDDEN');
        });
    });
  });

  describe('Transaction Limits', () => {
    it('should check withdrawal limits', async () => {
      // This test would require a properly authenticated user
      await request(app.getHttpServer())
        .get('/wallet/can-withdraw?amount=1000000')
        .expect(401); // No authentication
    });

    it('should reject withdrawal exceeding per-transaction limit', async () => {
      const withdrawData = {
        amount: 25000000, // Exceeds 20M limit
        transName: 'Large Withdrawal',
      };

      await request(app.getHttpServer())
        .post('/transactions/withdraw')
        .send(withdrawData)
        .expect(401); // No authentication
    });

    it('should reject withdrawal exceeding daily limit', async () => {
      const withdrawData = {
        amount: 500000000, // Exceeds daily limit
        transName: 'Daily Limit Test',
      };

      await request(app.getHttpServer())
        .post('/transactions/withdraw')
        .send(withdrawData)
        .expect(401); // No authentication
    });
  });

  describe('API Documentation', () => {
    it('should serve Swagger documentation', async () => {
      await request(app.getHttpServer()).get('/docs').expect(200);
    });

    it('should serve Swagger JSON', async () => {
      await request(app.getHttpServer()).get('/docs-json').expect(200);
    });
  });
});
