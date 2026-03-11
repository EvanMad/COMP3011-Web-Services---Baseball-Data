import { Test, TestingModule } from '@nestjs/testing';
import { TeamsService } from './teams.service';
import { PrismaService } from '../prisma.service';
import { StatsService } from '../stats/stats.service';
import { DeepMockProxy, mockDeep } from 'jest-mock-extended';
import { PrismaClient, Team } from '../../generated/prisma/client';
import { CreateTeamDto } from './dto/create-team.dto';
import { UpdateTeamDto } from './dto/update-team.dto';

const mockTeam = (overrides: Partial<Team> = {}): Team =>
  ({
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
    L: 72,
    divWin: 'Y',
    WCWin: 'N',
    LgWin: 'N',
    WSWin: 'N',
    R: 800,
    AB: 5500,
    H: 1400,
    double: 280,
    triple: 30,
    HR: 200,
    BB: 500,
    SO: 1200,
    SB: 100,
    CS: 40,
    HBP: 50,
    SF: 45,
    RA: 650,
    ER: 600,
    ERA: 3.8,
    CG: 2,
    SHO: 10,
    SV: 45,
    IPouts: 4400,
    HA: 1300,
    HRA: 180,
    BBA: 450,
    SOA: 1100,
    E: 100,
    DP: 150,
    FP: 0.98,
    park: 'Tropicana Field',
    attendance: 1200000,
    BPF: 100,
    PPF: 100,
    teamIDBR: null,
    teamIDlahman45: null,
    teamIDretro: null,
    ...overrides,
  }) as Team;

describe('TeamsService', () => {
  let service: TeamsService;
  let prismaMock: DeepMockProxy<PrismaClient>;

  beforeEach(async () => {
    prismaMock = mockDeep<PrismaClient>();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TeamsService,
        StatsService,
        { provide: PrismaService, useValue: prismaMock },
      ],
    }).compile();

    service = module.get<TeamsService>(TeamsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return paginated teams with default params', async () => {
      const teams = [mockTeam(), mockTeam({ teamID: 'NYY', id: 2 })];
      prismaMock.team.findMany.mockResolvedValue(teams);
      prismaMock.team.count.mockResolvedValue(2);

      const result = await service.findAll();

      expect(result.data).toHaveLength(2);
      expect(result.meta.total).toBe(2);
      expect(result.meta.page).toBe(1);
      expect(prismaMock.team.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 0,
          take: 20,
          orderBy: [{ yearID: 'desc' }, { teamID: 'asc' }],
        }),
      );
    });

    it('should filter by league when provided', async () => {
      prismaMock.team.findMany.mockResolvedValue([]);
      prismaMock.team.count.mockResolvedValue(0);

      await service.findAll(1, 20, 'AL');

      expect(prismaMock.team.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { lgID: 'AL' },
        }),
      );
    });

    it('should filter by year when provided', async () => {
      prismaMock.team.findMany.mockResolvedValue([]);
      prismaMock.team.count.mockResolvedValue(0);

      await service.findAll(1, 20, undefined, 2021);

      expect(prismaMock.team.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { yearID: 2021 },
        }),
      );
    });
  });

  describe('findAllTeams', () => {
    it('should return teams for franchise id with optional year filter', async () => {
      const teams = [mockTeam()];
      prismaMock.team.findMany.mockResolvedValue(teams);
      prismaMock.team.count.mockResolvedValue(1);

      const result = await service.findAllTeams('TBR', 1, 20);

      expect(result.data).toHaveLength(1);
      expect(prismaMock.team.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { teamID: 'TBR' },
          orderBy: { yearID: 'desc' },
        }),
      );
    });

    it('should filter by year when provided', async () => {
      prismaMock.team.findMany.mockResolvedValue([]);
      prismaMock.team.count.mockResolvedValue(0);

      await service.findAllTeams('TBR', 1, 20, 2019);

      expect(prismaMock.team.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { teamID: 'TBR', yearID: 2019 },
        }),
      );
    });
  });

  describe('findOne', () => {
    it('should return team by id and year with batting stats', async () => {
      const team = mockTeam();
      const sum = {
        H: 1400,
        AB: 5500,
        BB: 500,
        HBP: 50,
        SF: 45,
        DOUBLE: 280,
        TRIPLE: 30,
        HR: 200,
      };
      prismaMock.team.findUnique.mockResolvedValue(team);
      prismaMock.batting.aggregate.mockResolvedValue({
        _sum: sum,
        _avg: undefined,
        _count: undefined,
        _min: undefined,
        _max: undefined,
      } as never);

      const result = await service.findOne('TBR', 2020);

      expect(result).toBeDefined();
      expect(result?.teamID).toBe('TBR');
      expect(result?.name).toBe('Tampa Bay Rays');
      expect(result?.batting).toBeDefined();
      expect(
        (result?.batting as { battingAverage?: number })?.battingAverage,
      ).toBeDefined();
      expect(prismaMock.batting.aggregate).toHaveBeenCalledWith({
        where: { teamID: 'TBR', yearID: 2020 },
        _sum: {
          H: true,
          AB: true,
          BB: true,
          HBP: true,
          SF: true,
          DOUBLE: true,
          TRIPLE: true,
          HR: true,
        },
      });
    });

    it('should throw when team not found (mapToDto receives null)', async () => {
      prismaMock.team.findUnique.mockResolvedValue(null);
      prismaMock.batting.aggregate.mockResolvedValue({
        _sum: {
          H: 0,
          AB: 0,
          BB: 0,
          HBP: 0,
          SF: 0,
          DOUBLE: 0,
          TRIPLE: 0,
          HR: 0,
        },
        _avg: undefined,
        _count: undefined,
        _min: undefined,
        _max: undefined,
      } as never);

      await expect(service.findOne('XXX', 1999)).rejects.toThrow();
    });
  });

  describe('update', () => {
    it('should update team by id', async () => {
      const updated = mockTeam({ name: 'New Name' });
      prismaMock.team.update.mockResolvedValue(updated);

      const dto: UpdateTeamDto = { name: 'New Name' };
      const result = await service.update(1, dto);

      expect(prismaMock.team.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: dto,
      });
      expect(result.name).toBe('New Name');
    });
  });

  describe('create', () => {
    it('should create a team', async () => {
      const dto: CreateTeamDto = {
        yearID: 2022,
        teamID: 'TBR',
        name: 'Tampa Bay Rays',
        lgID: 'AL',
        franchID: 'TBR',
      };
      const created = mockTeam({ id: 2, ...dto });
      prismaMock.team.create.mockResolvedValue(created);

      const result = await service.create(dto);

      expect(prismaMock.team.create).toHaveBeenCalledWith({
        data: dto,
      });
      expect(result.teamID).toBe('TBR');
    });
  });

  describe('remove', () => {
    it('should delete team by id', async () => {
      prismaMock.team.delete.mockResolvedValue(mockTeam());

      await service.remove(1);

      expect(prismaMock.team.delete).toHaveBeenCalledWith({
        where: { id: 1 },
      });
    });
  });
});
