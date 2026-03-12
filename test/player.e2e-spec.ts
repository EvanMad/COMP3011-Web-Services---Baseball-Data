import request from 'supertest';
import type { Application } from 'express';
import { Test } from '@nestjs/testing';
import {
  BadRequestException,
  INestApplication,
  ValidationPipe,
} from '@nestjs/common';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma.service';
import { AllExceptionsFilter } from '../src/common/filters/http-exception.filter';

/**
 * Player e2e tests run against the real app and Testcontainers Postgres.
 * DATABASE_URL is set in test/setup-e2e.ts from the container started in global-setup-e2e.ts.
 */
describe('PlayerController (e2e)', () => {
  let app: INestApplication;
  let adminToken: string;
  let userToken: string;
  let createdPlayerId: string;

  const server = () => request(app.getHttpServer() as Application);

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    app.useGlobalFilters(new AllExceptionsFilter());
    app.useGlobalPipes(
      new ValidationPipe({
        transform: true,
        whitelist: true,
        forbidNonWhitelisted: true,
        exceptionFactory: (errors) =>
          new BadRequestException({
            statusCode: 400,
            error: 'Bad Request',
            message: 'Validation failed',
            errors: errors.map((e) => ({
              property: e.property,
              constraints: e.constraints,
            })),
          }),
    }));
    await app.init();

    const prisma = moduleRef.get(PrismaService);

    await server()
      .post('/auth/register')
      .send({ username: 'e2e-player-admin', password: 'admin123' })
      .expect(201);
    await server()
      .post('/auth/register')
      .send({ username: 'e2e-player-user', password: 'user123' })
      .expect(201);

    const adminUser = await prisma.user.findUnique({
      where: { username: 'e2e-player-admin' },
    });
    if (adminUser) {
      await prisma.user.update({
        where: { id: adminUser.id },
        data: { role: 'admin' },
      });
    }

    const adminRes = await server()
      .post('/auth/login')
      .send({ username: 'e2e-player-admin', password: 'admin123' });
    adminToken = (adminRes.body as { access_token: string }).access_token;

    const userRes = await server()
      .post('/auth/login')
      .send({ username: 'e2e-player-user', password: 'user123' });
    userToken = (userRes.body as { access_token: string }).access_token;

    const createRes = await server()
      .post('/player')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        playerID: 'e2e-test-01',
        nameFirst: 'E2E',
        nameLast: 'Player',
        weight: 180,
        height: 72,
        birthCountry: 'USA',
      })
      .expect(201);
    createdPlayerId = (createRes.body as { playerID: string }).playerID;
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /player/:id returns 200 and player shape for existing id', () => {
    return server()
      .get(`/player/${createdPlayerId}`)
      .expect(200)
      .expect((res) => {
        expect(res.body).toMatchObject({
          playerID: createdPlayerId,
          nameFirst: 'E2E',
          nameLast: 'Player',
          birthCountry: 'USA',
          weight: 180,
          height: 72,
        });
        expect(typeof res.body.playerID).toBe('string');
        expect(typeof res.body.nameFirst).toBe('string');
        expect(typeof res.body.nameLast).toBe('string');
        expect(typeof res.body.weight).toBe('number');
        expect(typeof res.body.height).toBe('number');
      });
  });

  it('GET /player/:id returns 404 for non-existent id', () => {
    return server().get('/player/nonexistent-id-99999').expect(404);
  });

  it('GET /player (list) returns 401 without auth', () => {
    return server().get('/player').expect(401);
  });

  it('GET /player (list) returns 200 with auth and paginated shape', () => {
    return server()
      .get('/player')
      .set('Authorization', `Bearer ${userToken}`)
      .expect(200)
      .expect((res) => {
        expect(res.body).toHaveProperty('data');
        expect(Array.isArray(res.body.data)).toBe(true);
        expect(res.body).toHaveProperty('meta');
        expect(res.body.meta).toMatchObject({
          page: expect.any(Number),
          limit: expect.any(Number),
          total: expect.any(Number),
          totalPages: expect.any(Number),
        });
        const found = res.body.data.find(
          (p: { playerID: string }) => p.playerID === createdPlayerId,
        );
        expect(found).toBeDefined();
        expect(found.nameFirst).toBe('E2E');
        expect(found.nameLast).toBe('Player');
      });
  });

  it('PATCH /player/:id returns 200 when admin updates player', () => {
    return server()
      .patch(`/player/${createdPlayerId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ weight: 185 })
      .expect(200)
      .expect((res) => {
        expect(res.body.playerID).toBe(createdPlayerId);
        expect(res.body.weight).toBe(185);
      });
  });

  it('PATCH /player/:id returns 401 without admin token', () => {
    return server()
      .patch(`/player/${createdPlayerId}`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({ weight: 190 })
      .expect(401);
  });

  it('DELETE /player/:id returns 401 without admin token', () => {
    return server()
      .delete(`/player/${createdPlayerId}`)
      .set('Authorization', `Bearer ${userToken}`)
      .expect(401);
  });

  it('DELETE /player/:id deletes player when admin', async () => {
    const deleteId = 'e2e-delete-me';
    await server()
      .post('/player')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        playerID: deleteId,
        nameFirst: 'Delete',
        nameLast: 'Me',
        weight: 150,
        height: 70,
      })
      .expect(201);

    await server()
      .delete(`/player/${deleteId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);

    await server().get(`/player/${deleteId}`).expect(404);
  });

  it('POST /player returns 401 without admin token', () => {
    return server()
      .post('/player')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        playerID: 'e2e-no-create',
        nameFirst: 'No',
        nameLast: 'Create',
        weight: 160,
        height: 71,
      })
      .expect(401);
  });

  it('POST /player returns 400 when body is invalid', () => {
    return server()
      .post('/player')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        playerID: 'x',
        nameFirst: '',
        nameLast: 'Last',
        weight: 170,
        height: 70,
      })
      .expect(400);
  });
});
