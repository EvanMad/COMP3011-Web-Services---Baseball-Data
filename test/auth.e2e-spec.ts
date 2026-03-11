import request from 'supertest';
import type { Application } from 'express';
import { Test } from '@nestjs/testing';
import { INestApplication, UnauthorizedException } from '@nestjs/common';
import { AppModule } from '../src/app.module';
import { AuthService } from '../src/auth/auth.service';
import { createTestApp } from './test-app.helper';

describe('AuthController (e2e)', () => {
  let app: INestApplication;
  const server = () => request(app.getHttpServer() as Application);

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(AuthService)
      .useValue({
        signUp: () =>
          Promise.resolve({ access_token: 'mock-token' }),
        signIn: (username: string, password: string) =>
          password === 'wrong'
            ? Promise.reject(new UnauthorizedException())
            : Promise.resolve({ access_token: 'mock-token' }),
      })
      .compile();

    app = await createTestApp(moduleRef);
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /auth/register', () => {
    it('returns 201 and access_token with valid body', () => {
      const body = { username: 'e2e-user', password: 'password123' };
      return server()
        .post('/auth/register')
        .send(body)
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('access_token');
          expect(typeof res.body.access_token).toBe('string');
        });
    });

  });

  describe('POST /auth/login', () => {
    it('returns 200 and access_token with valid credentials', () => {
      return server()
        .post('/auth/login')
        .send({ username: 'any', password: 'any' })
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('access_token');
          expect(res.body.access_token).toBe('mock-token');
        });
    });

    it('returns 401 with wrong password', () => {
      return server()
        .post('/auth/login')
        .send({ username: 'any', password: 'wrong' })
        .expect(401);
    });
  });
});
