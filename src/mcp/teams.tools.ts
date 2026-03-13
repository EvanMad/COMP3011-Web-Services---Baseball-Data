import { Injectable } from '@nestjs/common';
import { Tool } from '@rekog/mcp-nest';
import { z } from 'zod';
import { TeamsService } from '../teams/teams.service';
import type { TeamResponseDto } from '../teams/dto/team-response.dto';

@Injectable()
export class TeamsTools {
  constructor(private readonly teamsService: TeamsService) {}

  @Tool({
    name: 'list_teams',
    description:
      'List baseball teams, optionally filtered by league and/or year. Useful for discovering team IDs for further queries.',
    parameters: z.object({
      league: z
        .string()
        .optional()
        .describe('Optional league code (e.g. "AL", "NL").'),
      year: z
        .number()
        .int()
        .optional()
        .describe('Optional year to filter by (e.g. 2004).'),
      page: z
        .number()
        .int()
        .min(1)
        .default(1)
        .describe('Page number for pagination (1-based).'),
      limit: z
        .number()
        .int()
        .min(1)
        .max(50)
        .default(10)
        .describe('Max number of teams per page (1–50).'),
    }),
  })
  async listTeams(args: {
    league?: string;
    year?: number;
    page: number;
    limit: number;
  }): Promise<{
    summary: string;
    teams: {
      teamId: string;
      name: string;
      league: string;
      year: number;
      line: string;
    }[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }> {
    const { league, year, page, limit } = args;
    const result = await this.teamsService.findAll(page, limit, league, year);

    const contextParts: string[] = [];
    if (league) contextParts.push(`league ${league}`);
    if (year !== undefined) contextParts.push(`year ${year}`);
    const context =
      contextParts.length > 0 ? ` (${contextParts.join(', ')})` : '';

    const summary = `Teams list${context}: ${result.data.length} teams on this page (of ${result.meta.total} total).`;

    const teams = result.data.map((t: TeamResponseDto) => ({
      teamId: t.teamID,
      name: t.name,
      league: t.league,
      year: t.yearID,
      line: `${t.yearID} ${t.league} ${t.teamID} - ${t.name}`,
    }));

    const pagination = {
      page: result.meta.page,
      limit: result.meta.limit,
      total: result.meta.total,
      totalPages: result.meta.totalPages,
    };

    return { summary, teams, pagination };
  }

  @Tool({
    name: 'get_team_season',
    description:
      "Get a team's season record, wins, losses, and aggregate stats for a specific year.",
    parameters: z.object({
      teamId: z
        .string()
        .min(1)
        .describe('Team identifier (e.g. "BOS", "NYA").'),
      year: z.number().int().describe('Season year (e.g. 2004).'),
    }),
  })
  async getTeamSeason(args: { teamId: string; year: number }): Promise<{
    summary: string;
    team: TeamResponseDto;
  }> {
    const team = await this.teamsService.findOne(args.teamId, args.year);

    const summary = `Season ${team.yearID} ${team.league} ${team.teamID} - ${team.name}.`;

    return { summary, team };
  }
}
