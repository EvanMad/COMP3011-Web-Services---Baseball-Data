import { Test, TestingModule } from '@nestjs/testing';
import { TeamsService } from './teams.service';
import { PrismaService } from '../prisma.service';
import { StatsService } from '../stats/stats.service';
import { DeepMockProxy, mockDeep } from 'jest-mock-extended';
import { PrismaClient, Team } from '../../generated/prisma/client';

describe('TeamsService', () => {
  let service: TeamsService;
  let prismaMock: DeepMockProxy<PrismaClient>;

  beforeEach(async () => {
    prismaMock = mockDeep<PrismaClient>();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TeamsService,
        StatsService,
        {
          provide: PrismaService,
          useValue: prismaMock,
        },
      ],
    }).compile();

    service = module.get<TeamsService>(TeamsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should find a team by id and year', async () => {
    const mockTeam = {
      id: 1,
      yearID: 2020,
      teamID: 'TBR',
      name: 'Tampa Bay Rays',
      lgID: 'AL',
      franchID: 'TBR',
      divID: 'AL East',
      rank: 1,
      G: 162,
      Ghome: 81,
      W: 90,
    } as Team;

    prismaMock.team.findUnique.mockResolvedValue(mockTeam);

    const result = await service.findOne('TBR', 2020);
    expect(result).toBeDefined();
    expect(result?.teamID).toBe('TBR');
    expect(result?.name).toBe('Tampa Bay Rays');
  });
});
