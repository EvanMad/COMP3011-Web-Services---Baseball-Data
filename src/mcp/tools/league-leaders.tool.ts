import { Injectable } from '@nestjs/common';
import { Tool } from '@rekog/mcp-nest';
import { z } from 'zod';
import { AnalyticsService } from '../../analytics/analytics.service';
import {
  BATTING_STATS,
  PITCHING_STATS,
} from '../../analytics/dto/league-leaders-query.dto';
import type { LeagueLeadersResponseDto } from '../../analytics/dto/league-leaders-response.dto';

const battingStats = [...BATTING_STATS] as [string, ...string[]];
const pitchingStats = [...PITCHING_STATS] as [string, ...string[]];

const RATE_STATS = new Set([
  'battingAverage',
  'onBasePercentage',
  'sluggingPercentage',
  'era',
]);

function formatValue(stat: string, value: number): string {
  return RATE_STATS.has(stat) ? value.toFixed(3) : String(value);
}

function formatLeadersResponse(result: LeagueLeadersResponseDto): string {
  const period = result.year
    ? result.league
      ? `${result.year} ${result.league}`
      : String(result.year)
    : 'career';
  const header = `${period} ${result.category} — ${result.stat}`;
  const lines = result.leaders.map(
    (l) =>
      `  ${l.rank}. ${l.nameFirst} ${l.nameLast} — ${formatValue(result.stat, l.value)}`,
  );
  if (lines.length === 0) {
    return `${header}\n\nNo leaders found.`;
  }
  return `${header}\n\n${lines.join('\n')}`;
}

@Injectable()
export class LeagueLeadersTool {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Tool({
    name: 'get_league_leaders',
    description:
      'Get the top players for a batting or pitching stat. Seeded data covers 2000+. Omit year for career totals. For rate stats (e.g. battingAverage) only players with 100+ AB are included. ERA is ascending (lower is better).',
    parameters: z.object({
      category: z.enum(['batting', 'pitching']),
      stat: z.enum([...battingStats, ...pitchingStats]),
      year: z
        .number()
        .int()
        .min(1871)
        .optional()
        .describe('Season year (seeded data 2000+); omit for career'),
      league: z
        .string()
        .optional()
        .describe('League ID, e.g. AL or NL'),
      limit: z
        .number()
        .int()
        .min(1)
        .max(100)
        .default(10)
        .describe('Number of leaders to return'),
    }),
  })
  async getLeagueLeaders(args: {
    category: 'batting' | 'pitching';
    stat: string;
    year?: number;
    league?: string;
    limit?: number;
  }): Promise<string> {
    const result = await this.analyticsService.getLeagueLeaders({
      category: args.category,
      stat: args.stat,
      year: args.year,
      league: args.league,
      limit: args.limit ?? 10,
    });
    return formatLeadersResponse(result);
  }
}
