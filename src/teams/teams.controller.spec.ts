import { Test, TestingModule } from '@nestjs/testing';
import { TeamsController } from './teams.controller';
import { TeamsService } from './teams.service';
import { PrismaService } from '../prisma.service';
import { StatsService } from '../stats/stats.service';
import { mockDeep } from 'jest-mock-extended';
import { PrismaClient } from '../../generated/prisma/client';

describe('TeamsController', () => {
  let controller: TeamsController;

  beforeEach(async () => {
    const prismaMock = mockDeep<PrismaClient>();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [TeamsController],
      providers: [
        TeamsService,
        StatsService,
        {
          provide: PrismaService,
          useValue: prismaMock,
        },
      ],
    }).compile();

    controller = module.get<TeamsController>(TeamsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should call service.findAll with default page and limit when no query', async () => {
      const result = { data: [], meta: { total: 0, page: 1, limit: 20 } };
      jest
        .spyOn(controller['teamsService'], 'findAll')
        .mockResolvedValue(result as never);

      await controller.findAll({});

      expect(controller['teamsService'].findAll).toHaveBeenCalledWith(
        1,
        20,
        undefined,
        undefined,
      );
    });

    it('should pass query params to service', async () => {
      jest
        .spyOn(controller['teamsService'], 'findAll')
        .mockResolvedValue({ data: [], meta: {} } as never);

      await controller.findAll({ page: 2, limit: 5, league: 'NL', year: 1999 });

      expect(controller['teamsService'].findAll).toHaveBeenCalledWith(
        2,
        5,
        'NL',
        1999,
      );
    });
  });

  describe('findOneTeam', () => {
    it('should call service.findOne with id and year', async () => {
      const team = { teamID: 'BOS', yearID: 2020, name: 'Red Sox' };
      jest
        .spyOn(controller['teamsService'], 'findOne')
        .mockResolvedValue(team as never);

      const result = await controller.findOneTeam('BOS', 2020);

      expect(controller['teamsService'].findOne).toHaveBeenCalledWith(
        'BOS',
        2020,
      );
      expect(result).toEqual(team);
    });
  });

  describe('findAllYears', () => {
    it('should call service.findAllTeams with id and query', async () => {
      const result = { data: [], meta: {} };
      jest
        .spyOn(controller['teamsService'], 'findAllTeams')
        .mockResolvedValue(result as never);

      await controller.findAllYears('BOS', { page: 1, limit: 10, year: 2020 });

      expect(controller['teamsService'].findAllTeams).toHaveBeenCalledWith(
        'BOS',
        1,
        10,
        2020,
      );
    });
  });

  describe('remove', () => {
    it('should call service.remove with numeric id', async () => {
      jest
        .spyOn(controller['teamsService'], 'remove')
        .mockResolvedValue(undefined as never);

      await controller.remove('42');

      expect(controller['teamsService'].remove).toHaveBeenCalledWith(42);
    });
  });
});
