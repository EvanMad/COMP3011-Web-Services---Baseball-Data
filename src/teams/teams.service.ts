import { Injectable } from '@nestjs/common';
import { CreateTeamDto } from './dto/create-team.dto';
import { UpdateTeamDto } from './dto/update-team.dto';
import { PrismaService } from 'src/prisma.service';
import { TeamResponseDto } from './dto/team-response.dto';
import { plainToInstance } from 'class-transformer';
import { Result } from 'pg';
import { StatsService } from 'src/stats/stats.service';

@Injectable()
export class TeamsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly statsService: StatsService,
  ) { }

  create(createTeamDto: CreateTeamDto) {
    return 'This action adds a new team';
  }

  async findAll() {
    const teams = await this.prisma.team.findMany();
    return teams.map((team) => this.mapToDto(team));
  }

  async findAllTeams(id: string): Promise<TeamResponseDto[]> {
    const teams = await this.prisma.team.findMany({
      where: { teamID: id },
    });
    return teams.map((team) => this.mapToDto(team));
  }

  async findOne(id: string, year: number): Promise<TeamResponseDto | null> {
    console.log(`Fetching team with ID: ${id} for year: ${year}`);
    const team = await this.prisma.team.findUnique({
      where: {
        yearID_teamID: {
          teamID: id,
          yearID: year,
        },
      },
    });

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
      })
    ]);
    const s = stats._sum;

    // 2. Perform calculations via StatsService
    const career_batting = {
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
    return this.mapToDto({ ...team, career_batting });
  }

update(id: number, updateTeamDto: UpdateTeamDto) {
  return `This action updates a #${id} team`;
}

remove(id: number) {
  return `This action removes a #${id} team`;
}

  private mapToDto(team: any): TeamResponseDto {
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
      battingAverage: team.career_batting?.battingAverage,
      onBasePercentage: team.career_batting?.onBasePercentage,
      sluggingPercentage: team.career_batting?.sluggingPercentage    },

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
