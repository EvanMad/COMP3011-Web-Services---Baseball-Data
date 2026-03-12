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
 * Collection e2e tests run against the real app and Testcontainers Postgres.
 * Uses a real user (auth) and a player created by admin for collection playerIDs.
 */
describe('CollectionController (e2e)', () => {
  let app: INestApplication;
  let userToken: string;
  let adminToken: string;
  let playerId: string;
  let createdCollectionId: string;

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
      }),
    );
    await app.init();

    const prisma = moduleRef.get(PrismaService);

    await server()
      .post('/auth/register')
      .send({ username: 'e2e-collection-admin', password: 'admin123' })
      .expect(201);
    await server()
      .post('/auth/register')
      .send({ username: 'e2e-collection-user', password: 'user123' })
      .expect(201);

    const adminUser = await prisma.user.findUnique({
      where: { username: 'e2e-collection-admin' },
    });
    if (adminUser) {
      await prisma.user.update({
        where: { id: adminUser.id },
        data: { role: 'admin' },
      });
    }

    const adminRes = await server()
      .post('/auth/login')
      .send({ username: 'e2e-collection-admin', password: 'admin123' });
    adminToken = (adminRes.body as { access_token: string }).access_token;

    const userRes = await server()
      .post('/auth/login')
      .send({ username: 'e2e-collection-user', password: 'user123' });
    userToken = (userRes.body as { access_token: string }).access_token;

    const playerRes = await server()
      .post('/player')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        playerID: 'e2e-col-player',
        nameFirst: 'Collection',
        nameLast: 'Player',
        weight: 170,
        height: 70,
        birthCountry: 'USA',
      })
      .expect(201);
    playerId = (playerRes.body as { playerID: string }).playerID;

    const collectionRes = await server()
      .post('/collection')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        name: 'E2E Test Collection',
        description: 'For e2e tests',
        playerIDs: [playerId],
      })
      .expect(201);
    createdCollectionId = (collectionRes.body as { id: string }).id;
  });

  afterAll(async () => {
    await app.close();
  });

  it('POST /collection returns 401 without auth', () => {
    return server()
      .post('/collection')
      .send({
        name: 'Unauth',
        playerIDs: [playerId],
      })
      .expect(401);
  });

  it('POST /collection returns 400 when name is empty', () => {
    return server()
      .post('/collection')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        name: '',
        playerIDs: [playerId],
      })
      .expect(400);
  });

  it('POST /collection returns 400 when playerIDs is empty', () => {
    return server()
      .post('/collection')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        name: 'No players',
        playerIDs: [],
      })
      .expect(400);
  });

  it('GET /collection returns 401 without auth', () => {
    return server().get('/collection').expect(401);
  });

  it('GET /collection returns 200 with auth and paginated shape', () => {
    return server()
      .get('/collection')
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
          (c: { id: string }) => c.id === createdCollectionId,
        );
        expect(found).toBeDefined();
        expect(found.name).toBe('E2E Test Collection');
        expect(found.playerIDs).toContain(playerId);
      });
  });

  it('GET /collection accepts query params', () => {
    return server()
      .get('/collection')
      .set('Authorization', `Bearer ${userToken}`)
      .query({ page: 1, limit: 5 })
      .expect(200)
      .expect((res) => {
        expect(res.body.meta.limit).toBe(5);
        expect(res.body.data.length).toBeLessThanOrEqual(5);
      });
  });

  it('GET /collection/:id returns 401 without auth', () => {
    return server().get(`/collection/${createdCollectionId}`).expect(401);
  });

  it('GET /collection/:id returns 200 with auth and collection shape', () => {
    return server()
      .get(`/collection/${createdCollectionId}`)
      .set('Authorization', `Bearer ${userToken}`)
      .expect(200)
      .expect((res) => {
        expect(res.body).toMatchObject({
          id: createdCollectionId,
          name: 'E2E Test Collection',
          description: 'For e2e tests',
          playerIDs: [playerId],
        });
        expect(res.body).toHaveProperty('userId');
        expect(res.body).toHaveProperty('createdAt');
        expect(res.body).toHaveProperty('updatedAt');
      });
  });

  it('GET /collection/:id returns 404 for non-existent id', () => {
    return server()
      .get('/collection/nonexistent-cuid-99999')
      .set('Authorization', `Bearer ${userToken}`)
      .expect(404);
  });

  it('PATCH /collection/:id returns 401 without auth', () => {
    return server()
      .patch(`/collection/${createdCollectionId}`)
      .send({ name: 'Updated' })
      .expect(401);
  });

  it('PATCH /collection/:id returns 200 with auth and updates collection', () => {
    return server()
      .patch(`/collection/${createdCollectionId}`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({ name: 'E2E Updated Name', description: 'Updated description' })
      .expect(200)
      .expect((res) => {
        expect(res.body.name).toBe('E2E Updated Name');
        expect(res.body.description).toBe('Updated description');
      });
  });

  it('DELETE /collection/:id returns 401 without auth', () => {
    return server().delete(`/collection/${createdCollectionId}`).expect(401);
  });

  it('DELETE /collection/:id removes collection when authenticated', async () => {
    const createRes = await server()
      .post('/collection')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        name: 'To Delete',
        playerIDs: [playerId],
      })
      .expect(201);
    const idToDelete = (createRes.body as { id: string }).id;

    await server()
      .delete(`/collection/${idToDelete}`)
      .set('Authorization', `Bearer ${userToken}`)
      .expect(200);

    await server()
      .get(`/collection/${idToDelete}`)
      .set('Authorization', `Bearer ${userToken}`)
      .expect(404);
  });
});
