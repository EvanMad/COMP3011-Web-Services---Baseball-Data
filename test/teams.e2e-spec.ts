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
 * Teams e2e tests run against the real app and Testcontainers Postgres.
 */
describe('TeamsController (e2e)', () => {
  let app: INestApplication;
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
    await prisma.team.create({
      data: {
        yearID: 2024,
        lgID: 'NL',
        teamID: 'E2E',
        franchID: 'e2e',
        name: 'E2E Test Team',
        park: 'Test Park',
      },
    });
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /teams returns 200 and paginated shape', () => {
    return server()
      .get('/teams')
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
          hasNextPage: expect.any(Boolean),
          hasPreviousPage: expect.any(Boolean),
        });
      });
  });

  it('GET /teams accepts query params page and limit', () => {
    return server()
      .get('/teams')
      .query({ page: 1, limit: 5 })
      .expect(200)
      .expect((res) => {
        expect(res.body.meta.page).toBe(1);
        expect(res.body.meta.limit).toBe(5);
        expect(res.body.data.length).toBeLessThanOrEqual(5);
      });
  });

  it('GET /teams accepts optional year filter', () => {
    return server()
      .get('/teams')
      .query({ year: 2024 })
      .expect(200)
      .expect((res) => {
        expect(res.body).toHaveProperty('data');
        expect(
          res.body.data.every((t: { yearID: number }) => t.yearID === 2024),
        ).toBe(true);
      });
  });

  it('GET /teams/:id returns 200 and paginated list for team id', () => {
    return server()
      .get('/teams/E2E')
      .expect(200)
      .expect((res) => {
        expect(res.body).toHaveProperty('data');
        expect(Array.isArray(res.body.data)).toBe(true);
        expect(res.body).toHaveProperty('meta');
        expect(res.body.data.length).toBeGreaterThanOrEqual(1);
        expect(
          res.body.data.some((t: { teamID: string }) => t.teamID === 'E2E'),
        ).toBe(true);
      });
  });

  it('GET /teams/:id/:year returns 200 for existing team and year', () => {
    return server()
      .get('/teams/E2E/2024')
      .expect(200)
      .expect((res) => {
        expect(res.body).toMatchObject({
          teamID: 'E2E',
          yearID: 2024,
          name: 'E2E Test Team',
          league: 'NL',
        });
      });
  });

  it('GET /teams/:id/:year returns 404 for non-existent combination', () => {
    return server().get('/teams/XXX/1900').expect(404);
  });

  it('DELETE /teams/:id returns 404 for non-existent numeric id', () => {
    return server().delete('/teams/99999').expect(404);
  });

  it('GET /teams accepts optional league filter', () => {
    return server()
      .get('/teams')
      .query({ league: 'NL' })
      .expect(200)
      .expect((res) => {
        expect(
          res.body.data.every((t: { league: string }) => t.league === 'NL'),
        ).toBe(true);
      });
  });
});
