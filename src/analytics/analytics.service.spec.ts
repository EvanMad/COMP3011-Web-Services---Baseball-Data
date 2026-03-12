import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { PrismaService } from 'src/prisma.service';
import { StatsService } from 'src/stats/stats.service';
import { mockDeep, DeepMockProxy } from 'jest-mock-extended';
import { PrismaClient } from '../../generated/prisma/client';

describe('AnalyticsService', () => {
  let service: AnalyticsService;
  let prismaMock: DeepMockProxy<PrismaClient>;

  const mockStatsService = {
    calculateBattingAverage: jest.fn((h: number, ab: number) =>
      ab ? h / ab : 0,
    ),
    calculateOnBasePercentage: jest.fn(
      (h: number, bb: number, hbp: number, ab: number, sf: number) => {
        const pa = ab + bb + hbp + sf;
        return pa ? (h + bb + hbp) / pa : 0;
      },
    ),
    calculateTotalBases: jest.fn(
      (h: number, d: number, t: number, hr: number) =>
        h - d - t - hr + 2 * d + 3 * t + 4 * hr,
    ),
    calculateSluggingPercentage: jest.fn((tb: number, ab: number) =>
      ab ? tb / ab : 0,
    ),
  };

  beforeEach(async () => {
    prismaMock = mockDeep<PrismaClient>();
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AnalyticsService,
        { provide: PrismaService, useValue: prismaMock },
        { provide: StatsService, useValue: mockStatsService },
      ],
    }).compile();

    service = module.get<AnalyticsService>(AnalyticsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getLeagueLeaders', () => {
    describe('validation', () => {
      it('should throw BadRequestException when category is batting but stat is pitching', async () => {
        await expect(
          service.getLeagueLeaders({
            category: 'batting',
            stat: 'wins',
            limit: 10,
          }),
        ).rejects.toThrow(BadRequestException);
        await expect(
          service.getLeagueLeaders({
            category: 'batting',
            stat: 'wins',
            limit: 10,
          }),
        ).rejects.toThrow(/not a valid batting stat/);
      });

      it('should throw BadRequestException when category is pitching but stat is batting', async () => {
        await expect(
          service.getLeagueLeaders({
            category: 'pitching',
            stat: 'homeRuns',
            limit: 10,
          }),
        ).rejects.toThrow(BadRequestException);
        await expect(
          service.getLeagueLeaders({
            category: 'pitching',
            stat: 'homeRuns',
            limit: 10,
          }),
        ).rejects.toThrow(/not a valid pitching stat/);
      });
    });

    describe('batting counting stat', () => {
      it('should return batting league leaders for homeRuns', async () => {
        prismaMock.batting.groupBy.mockResolvedValue([
          {
            playerID: 'a01',
            _sum: {
              R: 100,
              H: 150,
              HR: 40,
              RBI: 120,
              SB: 5,
              BB: 60,
              AB: 500,
              HBP: 2,
              SF: 5,
              DOUBLE: 30,
              TRIPLE: 2,
            },
          },
          {
            playerID: 'b02',
            _sum: {
              R: 90,
              H: 140,
              HR: 35,
              RBI: 100,
              SB: 10,
              BB: 50,
              AB: 480,
              HBP: 1,
              SF: 4,
              DOUBLE: 25,
              TRIPLE: 1,
            },
          },
        ] as never);
        prismaMock.player.findMany.mockResolvedValue([
          { playerID: 'a01', nameFirst: 'Alice', nameLast: 'Ace' },
          { playerID: 'b02', nameFirst: 'Bob', nameLast: 'Bat' },
        ] as never);

        const result = await service.getLeagueLeaders({
          category: 'batting',
          stat: 'homeRuns',
          limit: 10,
        });

        expect(result.category).toBe('batting');
        expect(result.stat).toBe('homeRuns');
        expect(result.leaders).toHaveLength(2);
        expect(result.leaders[0]).toMatchObject({
          playerID: 'a01',
          nameFirst: 'Alice',
          nameLast: 'Ace',
          rank: 1,
          value: 40,
        });
        expect(result.leaders[1]).toMatchObject({
          playerID: 'b02',
          nameFirst: 'Bob',
          nameLast: 'Bat',
          rank: 2,
          value: 35,
        });
        expect(prismaMock.batting.groupBy).toHaveBeenCalledWith(
          expect.objectContaining({
            by: ['playerID'],
          }),
        );
      });

      it('should pass year and league to batting groupBy where', async () => {
        prismaMock.batting.groupBy.mockResolvedValue([]);
        prismaMock.player.findMany.mockResolvedValue([]);

        await service.getLeagueLeaders({
          category: 'batting',
          stat: 'hits',
          year: 2020,
          league: 'AL',
          limit: 5,
        });

        expect(prismaMock.batting.groupBy).toHaveBeenCalledWith(
          expect.objectContaining({
            where: { yearID: 2020, lgID: 'AL' },
          }),
        );
      });
    });

    describe('batting rate stat', () => {
      it('should return batting average leaders and call StatsService', async () => {
        prismaMock.batting.groupBy.mockResolvedValue([
          {
            playerID: 'p1',
            _sum: {
              R: 80,
              H: 150,
              HR: 20,
              RBI: 70,
              SB: 5,
              BB: 60,
              AB: 500,
              HBP: 2,
              SF: 5,
              DOUBLE: 30,
              TRIPLE: 2,
            },
          },
          {
            playerID: 'p2',
            _sum: {
              R: 70,
              H: 120,
              HR: 15,
              RBI: 60,
              SB: 8,
              BB: 40,
              AB: 400,
              HBP: 1,
              SF: 3,
              DOUBLE: 20,
              TRIPLE: 1,
            },
          },
        ] as never);
        prismaMock.player.findMany.mockResolvedValue([
          { playerID: 'p1', nameFirst: 'Player', nameLast: 'One' },
          { playerID: 'p2', nameFirst: 'Player', nameLast: 'Two' },
        ] as never);
        mockStatsService.calculateBattingAverage.mockImplementation((h, ab) =>
          ab ? Math.round((h / ab) * 1000) / 1000 : 0,
        );

        const result = await service.getLeagueLeaders({
          category: 'batting',
          stat: 'battingAverage',
          limit: 10,
        });

        expect(result.category).toBe('batting');
        expect(result.stat).toBe('battingAverage');
        expect(result.leaders).toHaveLength(2);
        expect(mockStatsService.calculateBattingAverage).toHaveBeenCalled();
      });
    });

    describe('pitching', () => {
      it('should return pitching league leaders for strikeouts', async () => {
        prismaMock.pitching.groupBy.mockResolvedValue([
          {
            playerID: 'pit1',
            _sum: { W: 15, L: 8, SO: 220, ERA: 2.5 },
            _count: { ERA: 1 },
          },
          {
            playerID: 'pit2',
            _sum: { W: 12, L: 10, SO: 180, ERA: 3.2 },
            _count: { ERA: 1 },
          },
        ] as never);
        prismaMock.player.findMany.mockResolvedValue([
          { playerID: 'pit1', nameFirst: 'Pitcher', nameLast: 'One' },
          { playerID: 'pit2', nameFirst: 'Pitcher', nameLast: 'Two' },
        ] as never);

        const result = await service.getLeagueLeaders({
          category: 'pitching',
          stat: 'strikeouts',
          limit: 10,
        });

        expect(result.category).toBe('pitching');
        expect(result.stat).toBe('strikeouts');
        expect(result.leaders).toHaveLength(2);
        expect(result.leaders[0]).toMatchObject({
          playerID: 'pit1',
          nameFirst: 'Pitcher',
          nameLast: 'One',
          rank: 1,
          value: 220,
        });
      });

      it('should return ERA leaders ascending (lower is better)', async () => {
        prismaMock.pitching.groupBy.mockResolvedValue([
          {
            playerID: 'low',
            _sum: { W: 10, L: 5, SO: 150, ERA: 2.1 },
            _count: { ERA: 1 },
          },
          {
            playerID: 'high',
            _sum: { W: 8, L: 12, SO: 100, ERA: 4.5 },
            _count: { ERA: 1 },
          },
        ] as never);
        prismaMock.player.findMany.mockResolvedValue([
          { playerID: 'low', nameFirst: 'Low', nameLast: 'ERA' },
          { playerID: 'high', nameFirst: 'High', nameLast: 'ERA' },
        ] as never);

        const result = await service.getLeagueLeaders({
          category: 'pitching',
          stat: 'era',
          limit: 10,
        });

        expect(result.leaders[0].playerID).toBe('low');
        expect(result.leaders[0].value).toBe(2.1);
        expect(result.leaders[1].playerID).toBe('high');
        expect(result.leaders[1].value).toBe(4.5);
      });

      it('should pass year and league to pitching groupBy where', async () => {
        prismaMock.pitching.groupBy.mockResolvedValue([]);
        prismaMock.player.findMany.mockResolvedValue([]);

        await service.getLeagueLeaders({
          category: 'pitching',
          stat: 'wins',
          year: 2019,
          league: 'NL',
          limit: 5,
        });

        expect(prismaMock.pitching.groupBy).toHaveBeenCalledWith(
          expect.objectContaining({
            where: { yearID: 2019, team: { lgID: 'NL' } },
          }),
        );
      });
    });

    describe('limit', () => {
      it('should respect limit and return only top N', async () => {
        prismaMock.batting.groupBy.mockResolvedValue([
          {
            playerID: '1',
            _sum: {
              R: 100,
              H: 200,
              HR: 50,
              RBI: 130,
              SB: 20,
              BB: 80,
              AB: 600,
              HBP: 5,
              SF: 6,
              DOUBLE: 40,
              TRIPLE: 5,
            },
          },
          {
            playerID: '2',
            _sum: {
              R: 90,
              H: 180,
              HR: 45,
              RBI: 120,
              SB: 15,
              BB: 70,
              AB: 580,
              HBP: 4,
              SF: 5,
              DOUBLE: 35,
              TRIPLE: 4,
            },
          },
          {
            playerID: '3',
            _sum: {
              R: 80,
              H: 160,
              HR: 40,
              RBI: 110,
              SB: 10,
              BB: 60,
              AB: 560,
              HBP: 3,
              SF: 4,
              DOUBLE: 30,
              TRIPLE: 3,
            },
          },
        ] as never);
        prismaMock.player.findMany.mockResolvedValue([
          { playerID: '1', nameFirst: 'A', nameLast: 'One' },
          { playerID: '2', nameFirst: 'B', nameLast: 'Two' },
        ] as never);

        const result = await service.getLeagueLeaders({
          category: 'batting',
          stat: 'homeRuns',
          limit: 2,
        });

        expect(result.leaders).toHaveLength(2);
        expect(result.leaders[0].playerID).toBe('1');
        expect(result.leaders[1].playerID).toBe('2');
      });
    });
  });
});
