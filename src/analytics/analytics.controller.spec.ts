import { Test, TestingModule } from '@nestjs/testing';
import { AnalyticsController } from './analytics.controller';
import { AnalyticsService } from './analytics.service';
import { BadRequestException } from '@nestjs/common';

describe('AnalyticsController', () => {
  let controller: AnalyticsController;
  let analyticsService: jest.Mocked<Pick<AnalyticsService, 'getLeagueLeaders'>>;

  const mockLeagueLeadersResponse = {
    category: 'batting' as const,
    stat: 'homeRuns',
    leaders: [
      {
        playerID: 'ruthba01',
        nameFirst: 'Babe',
        nameLast: 'Ruth',
        rank: 1,
        value: 60,
      },
    ],
  };

  beforeEach(async () => {
    analyticsService = {
      getLeagueLeaders: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AnalyticsController],
      providers: [
        {
          provide: AnalyticsService,
          useValue: analyticsService,
        },
      ],
    }).compile();

    controller = module.get<AnalyticsController>(AnalyticsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getLeagueLeaders', () => {
    it('should return league leaders from service with default limit', async () => {
      analyticsService.getLeagueLeaders.mockResolvedValue(
        mockLeagueLeadersResponse,
      );

      const result = await controller.getLeagueLeaders({
        category: 'batting',
        stat: 'homeRuns',
      });

      expect(analyticsService.getLeagueLeaders).toHaveBeenCalledWith({
        category: 'batting',
        stat: 'homeRuns',
        year: undefined,
        league: undefined,
        limit: 10,
      });
      expect(result).toEqual(mockLeagueLeadersResponse);
    });

    it('should pass query params to service', async () => {
      analyticsService.getLeagueLeaders.mockResolvedValue({
        ...mockLeagueLeadersResponse,
        year: 1927,
        league: 'AL',
      });

      const result = await controller.getLeagueLeaders({
        category: 'batting',
        stat: 'homeRuns',
        year: 1927,
        league: 'AL',
        limit: 5,
      });

      expect(analyticsService.getLeagueLeaders).toHaveBeenCalledWith({
        category: 'batting',
        stat: 'homeRuns',
        year: 1927,
        league: 'AL',
        limit: 5,
      });
      expect(result.year).toBe(1927);
      expect(result.league).toBe('AL');
    });

    it('should propagate BadRequestException from service', async () => {
      analyticsService.getLeagueLeaders.mockRejectedValue(
        new BadRequestException('Invalid stat for category'),
      );

      await expect(
        controller.getLeagueLeaders({
          category: 'pitching',
          stat: 'homeRuns',
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });
});
