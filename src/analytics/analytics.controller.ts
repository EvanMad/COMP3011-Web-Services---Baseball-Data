import { Controller, Get, Query } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ErrorDto } from 'src/common/dto/error.dto';
import { LeagueLeadersQueryDto } from './dto/league-leaders-query.dto';
import { LeagueLeadersResponseDto } from './dto/league-leaders-response.dto';
import { AnalyticsService } from './analytics.service';
import { BATTING_STATS, PITCHING_STATS } from './dto/league-leaders-query.dto';

@ApiTags('analytics')
@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('league-leaders')
  @ApiOperation({
    summary: 'Get league leaders for a stat',
    description:
      'Returns the top players for a given batting or pitching stat. Optionally filter by year and league. For rate stats (e.g. battingAverage), only players with at least 100 AB are included. ERA leaders are sorted ascending (lower is better).',
  })
  @ApiQuery({
    name: 'category',
    enum: ['batting', 'pitching'],
    description: 'Stat category',
  })
  @ApiQuery({
    name: 'stat',
    enum: [...BATTING_STATS, ...PITCHING_STATS],
    description:
      'Stat to rank by. Must match category (e.g. batting + homeRuns, pitching + strikeouts).',
  })
  @ApiQuery({
    name: 'year',
    required: false,
    type: Number,
    description: 'Season year (omit for career totals)',
  })
  @ApiQuery({
    name: 'league',
    required: false,
    type: String,
    description: 'League ID (e.g. AL, NL)',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Number of leaders (default 10, max 100)',
  })
  @ApiResponse({
    status: 200,
    description: 'League leaders for the requested stat',
    type: LeagueLeadersResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid query (e.g. stat/category mismatch)',
    type: ErrorDto,
  })
  async getLeagueLeaders(
    @Query() query: LeagueLeadersQueryDto,
  ): Promise<LeagueLeadersResponseDto> {
    return this.analyticsService.getLeagueLeaders({
      category: query.category,
      stat: query.stat,
      year: query.year,
      league: query.league,
      limit: query.limit ?? 10,
    });
  }
}
