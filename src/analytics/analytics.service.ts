import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { StatsService } from 'src/stats/stats.service';
import { BATTING_STATS, PITCHING_STATS } from './dto/league-leaders-query.dto';
import {
  LeagueLeaderEntryDto,
  LeagueLeadersResponseDto,
} from './dto/league-leaders-response.dto';

type LeagueLeadersQuery = {
  category: 'batting' | 'pitching';
  stat: string;
  year?: number;
  league?: string;
  limit: number;
};

@Injectable()
export class AnalyticsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly statsService: StatsService,
  ) {}

  async getLeagueLeaders(
    query: LeagueLeadersQuery,
  ): Promise<LeagueLeadersResponseDto> {
    const { category, stat, year, league, limit } = query;

    this.validateStatForCategory(category, stat);

    if (category === 'batting') {
      return this.getBattingLeagueLeaders(stat, year, league, limit);
    }
    return this.getPitchingLeagueLeaders(stat, year, league, limit);
  }

  private validateStatForCategory(
    category: 'batting' | 'pitching',
    stat: string,
  ): void {
    const battingSet = new Set<string>(BATTING_STATS);
    const pitchingSet = new Set<string>(PITCHING_STATS);
    if (category === 'batting' && !battingSet.has(stat)) {
      throw new BadRequestException(
        `Stat "${stat}" is not a valid batting stat. Valid: ${BATTING_STATS.join(', ')}`,
      );
    }
    if (category === 'pitching' && !pitchingSet.has(stat)) {
      throw new BadRequestException(
        `Stat "${stat}" is not a valid pitching stat. Valid: ${PITCHING_STATS.join(', ')}`,
      );
    }
  }

  private async getBattingLeagueLeaders(
    stat: string,
    year?: number,
    league?: string,
    limit: number = 10,
  ): Promise<LeagueLeadersResponseDto> {
    const where: { yearID?: number; lgID?: string } = {};
    if (year !== undefined) where.yearID = year;
    if (league !== undefined && league !== '') where.lgID = league;

    const groups = await this.prisma.batting.groupBy({
      by: ['playerID'],
      where: Object.keys(where).length ? where : undefined,
      _sum: {
        R: true,
        H: true,
        HR: true,
        RBI: true,
        SB: true,
        BB: true,
        AB: true,
        HBP: true,
        SF: true,
        DOUBLE: true,
        TRIPLE: true,
      },
    });

    type Row = { playerID: string; value: number };
    let rows: Row[] = [];

    const rateStats = [
      'battingAverage',
      'onBasePercentage',
      'sluggingPercentage',
    ];
    const MIN_AB_FOR_RATE = 100;
    if (rateStats.includes(stat)) {
      rows = groups
        .map((g) => {
          const s = g._sum;
          const H = s.H ?? 0;
          const AB = s.AB ?? 0;
          const BB = s.BB ?? 0;
          const HBP = s.HBP ?? 0;
          const SF = s.SF ?? 0;
          const DOUBLE = s.DOUBLE ?? 0;
          const TRIPLE = s.TRIPLE ?? 0;
          const HR = s.HR ?? 0;
          if (AB < MIN_AB_FOR_RATE) return { playerID: g.playerID, value: 0 };
          let value = 0;
          if (stat === 'battingAverage') {
            value = this.statsService.calculateBattingAverage(H, AB);
          } else if (stat === 'onBasePercentage') {
            value = this.statsService.calculateOnBasePercentage(
              H,
              BB,
              HBP,
              AB,
              SF,
            );
          } else {
            const tb = this.statsService.calculateTotalBases(
              H,
              DOUBLE,
              TRIPLE,
              HR,
            );
            value = this.statsService.calculateSluggingPercentage(tb, AB);
          }
          return { playerID: g.playerID, value };
        })
        .filter((r) => r.value > 0);
    } else {
      const fieldMap: Record<
        string,
        keyof NonNullable<(typeof groups)[0]['_sum']>
      > = {
        homeRuns: 'HR',
        hits: 'H',
        runs: 'R',
        rbi: 'RBI',
        stolenBases: 'SB',
        walks: 'BB',
      };
      const field = fieldMap[stat];
      if (!field) {
        throw new BadRequestException(`Unknown batting stat: ${stat}`);
      }
      rows = groups.map((g) => ({
        playerID: g.playerID,
        value: g._sum[field] ?? 0,
      }));
    }

    const asc = stat === 'era' ? false : false; // batting: always desc
    rows.sort((a, b) => (asc ? a.value - b.value : b.value - a.value));
    const top = rows.slice(0, limit);
    const playerIDs = top.map((r) => r.playerID);

    const players = await this.prisma.player.findMany({
      where: { playerID: { in: playerIDs } },
      select: { playerID: true, nameFirst: true, nameLast: true },
    });
    const playerMap = new Map(players.map((p) => [p.playerID, p]));

    const leaders: LeagueLeaderEntryDto[] = top.map((r, index) => {
      const p = playerMap.get(r.playerID);
      return {
        playerID: r.playerID,
        nameFirst: p?.nameFirst ?? '',
        nameLast: p?.nameLast ?? '',
        rank: index + 1,
        value: Math.round(r.value * 1000) / 1000, // keep 3 decimals for rates
      };
    });

    return {
      category: 'batting',
      stat,
      ...(year !== undefined && { year }),
      ...(league !== undefined && league !== '' && { league }),
      leaders,
    };
  }

  private async getPitchingLeagueLeaders(
    stat: string,
    year?: number,
    league?: string,
    limit: number = 10,
  ): Promise<LeagueLeadersResponseDto> {
    const where: { yearID?: number; team?: { lgID: string } } = {};
    if (year !== undefined) where.yearID = year;
    if (league !== undefined && league !== '') where.team = { lgID: league };
    const groups = await this.prisma.pitching.groupBy({
      by: ['playerID'],
      where: Object.keys(where).length ? where : undefined,
      _sum: {
        W: true,
        L: true,
        SO: true,
        ERA: true,
      },
      _count: { ERA: true },
    });

    type Row = { playerID: string; value: number };
    let rows: Row[] = [];

    if (stat === 'era') {
      // Use average ERA across stints (or sum(ER)/sum(IP) for proper ERA; schema has ERA per row)
      rows = groups
        .map((g) => ({
          playerID: g.playerID,
          value:
            g._sum.ERA != null ? g._sum.ERA / Math.max(1, g._count.ERA) : 999,
        }))
        .filter((r) => r.value < 999 && r.value > 0);
      rows.sort((a, b) => a.value - b.value); // ascending: lower ERA is better
    } else {
      const fieldMap: Record<string, 'W' | 'L' | 'SO'> = {
        wins: 'W',
        losses: 'L',
        strikeouts: 'SO',
      };
      const field = fieldMap[stat];
      if (!field) {
        throw new BadRequestException(`Unknown pitching stat: ${stat}`);
      }
      rows = groups.map((g) => ({
        playerID: g.playerID,
        value: g._sum[field] ?? 0,
      }));
      rows.sort((a, b) => b.value - a.value);
    }

    const top = rows.slice(0, limit);
    const playerIDs = top.map((r) => r.playerID);
    const players = await this.prisma.player.findMany({
      where: { playerID: { in: playerIDs } },
      select: { playerID: true, nameFirst: true, nameLast: true },
    });
    const playerMap = new Map(players.map((p) => [p.playerID, p]));

    const leaders: LeagueLeaderEntryDto[] = top.map((r, index) => {
      const p = playerMap.get(r.playerID);
      return {
        playerID: r.playerID,
        nameFirst: p?.nameFirst ?? '',
        nameLast: p?.nameLast ?? '',
        rank: index + 1,
        value: stat === 'era' ? Math.round(r.value * 1000) / 1000 : r.value,
      };
    });

    return {
      category: 'pitching',
      stat,
      ...(year !== undefined && { year }),
      ...(league !== undefined && league !== '' && { league }),
      leaders,
    };
  }
}
