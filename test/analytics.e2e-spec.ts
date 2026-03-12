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

interface LeagueLeaderEntry {
  playerID: string;
  nameFirst: string;
  nameLast: string;
  rank: number;
  value: number;
}

interface LeagueLeadersResponse {
  category: 'batting' | 'pitching';
  stat: string;
  year?: number;
  league?: string;
  leaders: LeagueLeaderEntry[];
}

/**
 * Analytics e2e tests run against the real app and Testcontainers Postgres.
 * Creates minimal player/batting/pitching data so league-leaders returns results.
 */
describe('AnalyticsController (e2e)', () => {
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

    // Team required for batting/pitching (yearID, teamID). Use E2A to avoid clash with teams.e2e-spec (E2E).
    await prisma.team.upsert({
      where: {
        yearID_teamID: { yearID: 2024, teamID: 'E2A' },
      },
      create: {
        yearID: 2024,
        lgID: 'AL',
        teamID: 'E2A',
        franchID: 'e2e',
        name: 'E2E Analytics Team',
        park: 'Test Park',
      },
      update: {},
    });

    await prisma.player.upsert({
      where: { playerID: 'e2e-lead-01' },
      create: {
        playerID: 'e2e-lead-01',
        nameFirst: 'E2E',
        nameLast: 'Leader',
        weight: 200,
        height: 72,
      },
      update: {},
    });

    await prisma.batting.create({
      data: {
        playerID: 'e2e-lead-01',
        yearID: 2024,
        stint: 1,
        teamID: 'E2A',
        lgID: 'AL',
        G: 162,
        AB: 600,
        H: 180,
        R: 100,
        HR: 35,
        RBI: 110,
        BB: 70,
        SB: 10,
        HBP: 3,
        SF: 5,
        DOUBLE: 40,
        TRIPLE: 2,
      },
    });

    await prisma.pitching.create({
      data: {
        playerID: 'e2e-lead-01',
        yearID: 2024,
        stint: 1,
        teamID: 'E2A',
        W: 15,
        L: 8,
        SO: 200,
        ERA: 2.8,
      },
    });
  });

  afterAll(async () => {
    await app.close();
  });

  describe('GET /analytics/league-leaders', () => {
    it('returns 200 and response shape for batting homeRuns', () => {
      return server()
        .get('/analytics/league-leaders')
        .query({ category: 'batting', stat: 'homeRuns' })
        .expect(200)
        .expect((res) => {
          const body = res.body as LeagueLeadersResponse;
          expect(body).toHaveProperty('category', 'batting');
          expect(body).toHaveProperty('stat', 'homeRuns');
          expect(body).toHaveProperty('leaders');
          expect(Array.isArray(body.leaders)).toBe(true);
          body.leaders.forEach((entry) => {
            expect(entry).toHaveProperty('playerID');
            expect(entry).toHaveProperty('nameFirst');
            expect(entry).toHaveProperty('nameLast');
            expect(entry).toHaveProperty('rank');
            expect(entry).toHaveProperty('value');
          });
        });
    });

    it('returns 200 for batting hits with year filter', () => {
      return server()
        .get('/analytics/league-leaders')
        .query({ category: 'batting', stat: 'hits', year: 2024 })
        .expect(200)
        .expect((res) => {
          const body = res.body as LeagueLeadersResponse;
          expect(body.category).toBe('batting');
          expect(body.stat).toBe('hits');
          expect(body.year).toBe(2024);
          expect(body.leaders.length).toBeGreaterThanOrEqual(0);
        });
    });

    it('returns 200 for pitching strikeouts', () => {
      return server()
        .get('/analytics/league-leaders')
        .query({ category: 'pitching', stat: 'strikeouts' })
        .expect(200)
        .expect((res) => {
          const body = res.body as LeagueLeadersResponse;
          expect(body.category).toBe('pitching');
          expect(body.stat).toBe('strikeouts');
          expect(Array.isArray(body.leaders)).toBe(true);
        });
    });

    it('accepts limit query param', () => {
      return server()
        .get('/analytics/league-leaders')
        .query({ category: 'batting', stat: 'homeRuns', limit: 5 })
        .expect(200)
        .expect((res) => {
          const body = res.body as LeagueLeadersResponse;
          expect(body.leaders.length).toBeLessThanOrEqual(5);
        });
    });

    it('returns 400 when category is missing', () => {
      return server()
        .get('/analytics/league-leaders')
        .query({ stat: 'homeRuns' })
        .expect(400);
    });

    it('returns 400 when stat is missing', () => {
      return server()
        .get('/analytics/league-leaders')
        .query({ category: 'batting' })
        .expect(400);
    });

    it('returns 400 when category is invalid', () => {
      return server()
        .get('/analytics/league-leaders')
        .query({ category: 'fielding', stat: 'homeRuns' })
        .expect(400);
    });

    it('returns 400 when stat is invalid for category (pitching stat with batting)', () => {
      return server()
        .get('/analytics/league-leaders')
        .query({ category: 'batting', stat: 'wins' })
        .expect(400);
    });

    it('returns 400 when limit is over max', () => {
      return server()
        .get('/analytics/league-leaders')
        .query({ category: 'batting', stat: 'homeRuns', limit: 500 })
        .expect(400);
    });
  });
});
