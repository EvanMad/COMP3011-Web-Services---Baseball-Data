import request from 'supertest';
import type { Application } from 'express';
import { Test } from '@nestjs/testing';
import { INestApplication, NotFoundException } from '@nestjs/common';
import { AppModule } from '../src/app.module';
import { TeamsService } from '../src/teams/teams.service';
import { createTestApp } from './test-app.helper';

const mockPaginated = (data: unknown[] = []) => ({
  data,
  meta: {
    total: data.length,
    page: 1,
    limit: 20,
    totalPages: data.length ? 1 : 0,
    hasNextPage: false,
    hasPreviousPage: false,
  },
});

describe('TeamsController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(TeamsService)
      .useValue({
        findAll: () => Promise.resolve(mockPaginated([])),
        findAllTeams: () => Promise.resolve(mockPaginated([])),
        findOne: (id: string, year: number | string) =>
          id === 'XXX' && Number(year) === 1900
            ? Promise.reject(new NotFoundException('Team not found'))
            : Promise.resolve({} as never),
      })
      .compile();

    app = await createTestApp(moduleRef);
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /teams returns 200 and paginated list', () => {
    return request(app.getHttpServer() as Application)
      .get('/teams')
      .expect(200)
      .expect((res) => {
        expect(res.body).toHaveProperty('data');
        expect(Array.isArray(res.body.data)).toBe(true);
        expect(res.body).toHaveProperty('meta');
      });
  });

  it('GET /teams accepts query params', () => {
    return request(app.getHttpServer() as Application)
      .get('/teams')
      .query({ page: 1, limit: 5 })
      .expect(200)
      .expect((res) => {
        expect(res.body).toHaveProperty('data');
        expect(res.body.meta).toMatchObject({ page: 1, limit: 20 });
      });
  });

  it('GET /teams/:id returns 200 and list for valid team id', () => {
    return request(app.getHttpServer() as Application)
      .get('/teams/NYY')
      .expect(200)
      .expect((res) => {
        expect(res.body).toHaveProperty('data');
        expect(Array.isArray(res.body.data)).toBe(true);
      });
  });

  it('GET /teams/:id/:year returns 404 for non-existent combination', () => {
    return request(app.getHttpServer() as Application)
      .get('/teams/XXX/1900')
      .expect(404);
  });
});
