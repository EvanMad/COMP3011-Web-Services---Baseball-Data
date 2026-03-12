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

interface TeamsPaginatedMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

interface TeamListItem {
  teamID: string;
  yearID: number;
  name: string;
  league: string;
}

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
        const body = res.body as {
          data: TeamListItem[];
          meta: TeamsPaginatedMeta;
        };
        expect(body).toHaveProperty('data');
        expect(Array.isArray(body.data)).toBe(true);
        expect(body).toHaveProperty('meta');
        expect(typeof body.meta.page).toBe('number');
        expect(typeof body.meta.limit).toBe('number');
        expect(typeof body.meta.total).toBe('number');
        expect(typeof body.meta.totalPages).toBe('number');
        expect(typeof body.meta.hasNextPage).toBe('boolean');
        expect(typeof body.meta.hasPreviousPage).toBe('boolean');
      });
  });

  it('GET /teams accepts query params page and limit', () => {
    return server()
      .get('/teams')
      .query({ page: 1, limit: 5 })
      .expect(200)
      .expect((res) => {
        const body = res.body as {
          data: TeamListItem[];
          meta: TeamsPaginatedMeta;
        };
        expect(body.meta.page).toBe(1);
        expect(body.meta.limit).toBe(5);
        expect(body.data.length).toBeLessThanOrEqual(5);
      });
  });

  it('GET /teams accepts optional year filter', () => {
    return server()
      .get('/teams')
      .query({ year: 2024 })
      .expect(200)
      .expect((res) => {
        const body = res.body as {
          data: TeamListItem[];
          meta: TeamsPaginatedMeta;
        };
        expect(body).toHaveProperty('data');
        expect(body.data.every((t) => t.yearID === 2024)).toBe(true);
      });
  });

  it('GET /teams/:id returns 200 and paginated list for team id', () => {
    return server()
      .get('/teams/E2E')
      .expect(200)
      .expect((res) => {
        const body = res.body as {
          data: TeamListItem[];
          meta: TeamsPaginatedMeta;
        };
        expect(body).toHaveProperty('data');
        expect(Array.isArray(body.data)).toBe(true);
        expect(body).toHaveProperty('meta');
        expect(body.data.length).toBeGreaterThanOrEqual(1);
        expect(body.data.some((t) => t.teamID === 'E2E')).toBe(true);
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
        const body = res.body as {
          data: TeamListItem[];
          meta: TeamsPaginatedMeta;
        };
        expect(body.data.every((t) => t.league === 'NL')).toBe(true);
      });
  });
});
