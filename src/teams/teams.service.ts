import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { TeamResponseDto } from './dto/team-response.dto';
import { plainToInstance } from 'class-transformer';
import { StatsService } from 'src/stats/stats.service';
import { Team } from '../../generated/prisma/client';
import { CreateTeamDto } from './dto/create-team.dto';
import { UpdateTeamDto } from './dto/update-team.dto';
import {
  getPaginationParams,
  paginate,
  PaginatedResponse,
} from 'src/common/pagination.dto';

export interface BattingCalculations {
  battingAverage: number;
  onBasePercentage: number;
  sluggingPercentage: number;
}

@Injectable()
export class TeamsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly statsService: StatsService,
  ) {}

  async findAll(
    page: number = 1,
    limit: number = 20,
  ): Promise<PaginatedResponse<TeamResponseDto>> {
    const { skip, take } = getPaginationParams(page, limit);
    const [teams, total] = await Promise.all([
      this.prisma.team.findMany({ skip, take, orderBy: [{ yearID: 'desc' }, { teamID: 'asc' }] }),
      this.prisma.team.count(),
    ]);
    const data = teams.map((team) => this.mapToDto(team));
    return paginate(data, total, page, limit);
  }

  async findAllTeams(
    id: string,
    page: number = 1,
    limit: number = 20,
  ): Promise<PaginatedResponse<TeamResponseDto>> {
    const { skip, take } = getPaginationParams(page, limit);
    const [teams, total] = await Promise.all([
      this.prisma.team.findMany({
        where: { teamID: id },
        skip,
        take,
        orderBy: { yearID: 'desc' },
      }),
      this.prisma.team.count({ where: { teamID: id } }),
    ]);
    const data = teams.map((team) => this.mapToDto(team));
    return paginate(data, total, page, limit);
  }

  async findOne(id: string, year: number): Promise<TeamResponseDto> {
    const team = await this.prisma.team.findUnique({
      where: {
        yearID_teamID: {
          teamID: id,
          yearID: year,
        },
      },
    });
    if (!team) {
      throw new NotFoundException('Team not found');
    }

    // Calculate stats using stat service
    const [stats] = await Promise.all([
      this.prisma.batting.aggregate({
        where: { teamID: id, yearID: year },
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
      }),
    ]);
    if (!stats) {
      return this.mapToDto(team);
    }
    const s = stats._sum;

    // 2. Perform calculations via StatsService
    const career_batting: BattingCalculations = {
      battingAverage: this.statsService.calculateBattingAverage(
        s.H || 0,
        s.AB || 0,
      ),
      onBasePercentage: this.statsService.calculateOnBasePercentage(
        s.H || 0,
        s.BB || 0,
        s.HBP || 0,
        s.AB || 0,
        s.SF || 0,
      ),
      sluggingPercentage: this.statsService.calculateSluggingPercentage(
        this.statsService.calculateTotalBases(
          s.H || 0,
          s.DOUBLE || 0,
          s.TRIPLE || 0,
          s.HR || 0,
        ),
        s.AB || 0,
      ),
    };

    // Merge stats into team object for DTO mapping
    return this.mapToDto(team, career_batting);
  }

  async update(id: number, updateTeamDto: UpdateTeamDto) {
    const team = await this.prisma.team.findUnique({ where: { id } });
    if (!team) {
      throw new NotFoundException('Team not found');
    }
    return await this.prisma.team.update({
      where: { id },
      data: updateTeamDto,
    });
  }

  async create(createTeamDto: CreateTeamDto) {
    return await this.prisma.team.create({
      data: createTeamDto,
    });
  }

  async remove(id: number) {
    const team = await this.prisma.team.findUnique({ where: { id } });
    if (!team) {
      throw new NotFoundException('Team not found');
    }
    return await this.prisma.team.delete({
      where: { id },
    });
  }

  private mapToDto(
    team: Team,
    career_batting?: BattingCalculations,
  ): TeamResponseDto {
    return plainToInstance(TeamResponseDto, {
      yearID: team.yearID,
      teamID: team.teamID,
      name: team.name,
      league: team.lgID,
      franchiseID: team.franchID,
      divisionID: team.divID,
      park: team.park,
      attendance: team.attendance,

      results: {
        games: team.G,
        wins: team.W,
        losses: team.L,
        rank: team.rank,
        divisionWin: team.divWin === 'Y',
        wildCardWin: team.WCWin === 'Y',
        leagueWin: team.LgWin === 'Y',
        worldSeriesWin: team.WSWin === 'Y',
      },

      batting: {
        runs: team.R,
        atBats: team.AB,
        hits: team.H,
        doubles: team.double,
        triples: team.triple,
        homeRuns: team.HR,
        walks: team.BB,
        strikeouts: team.SO,
        stolenBases: team.SB,
        caughtStealing: team.CS,
        hitByPitch: team.HBP,
        sacrificeFlies: team.SF,
        battingAverage: career_batting?.battingAverage,
        onBasePercentage: career_batting?.onBasePercentage,
        sluggingPercentage: career_batting?.sluggingPercentage,
      },

      pitching: {
        runsAllowed: team.RA,
        earnedRuns: team.ER,
        era: team.ERA,
        saves: team.SV,
        hrAllowed: team.HRA,
        errors: team.E,
        fieldingPercentage: team.FP,
      },
    });
  }
}
