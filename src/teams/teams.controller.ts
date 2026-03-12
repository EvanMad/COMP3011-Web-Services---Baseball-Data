import { Controller, Delete, Get, Param, Query } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ErrorDto } from 'src/common/dto/error.dto';
import { DEFAULT_LIMIT, DEFAULT_PAGE } from 'src/common/pagination.dto';
import { PaginatedTeamResponseDto } from './dto/paginated-team-response.dto';
import { TeamResponseDto } from './dto/team-response.dto';
import { TeamsQueryDto } from './dto/teams-query.dto';
import { TeamsService } from './teams.service';

@ApiTags('teams')
@Controller('teams')
export class TeamsController {
  constructor(private readonly teamsService: TeamsService) {}

  @Get()
  @ApiOperation({ summary: 'List teams (paginated, optional league/year filters)' })
  @ApiResponse({ status: 200, description: 'Paginated list of teams', type: () => PaginatedTeamResponseDto })
  findAll(@Query() query: TeamsQueryDto) {
    return this.teamsService.findAll(
      query.page ?? DEFAULT_PAGE,
      query.limit ?? DEFAULT_LIMIT,
      query.league,
      query.year,
    );
  }

  @Get(':id/:year')
  @ApiOperation({ summary: 'Get team by ID and year' })
  @ApiParam({ name: 'id', description: 'Team ID' })
  @ApiParam({ name: 'year', description: 'Year' })
  @ApiResponse({ status: 200, description: 'Team found', type: () => TeamResponseDto })
  @ApiResponse({ status: 404, description: 'Team not found', type: ErrorDto })
  findOneTeam(@Param('id') id: string, @Param('year') year: number) {
    return this.teamsService.findOne(id, year);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'List all years for a team (paginated)',
    description: 'Returns team records for the given team ID across seasons. Use query param `year` to filter. The team ID here is the franchise/team identifier (e.g. BOS), not the numeric primary key.',
  })
  @ApiParam({ name: 'id', description: 'Team ID (e.g. BOS, NYA)' })
  @ApiResponse({ status: 200, description: 'Paginated list of team records by year', type: () => PaginatedTeamResponseDto })
  findAllYears(@Param('id') id: string, @Query() query: TeamsQueryDto) {
    return this.teamsService.findAllTeams(
      id,
      query.page ?? DEFAULT_PAGE,
      query.limit ?? DEFAULT_LIMIT,
      query.year,
    );
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Remove a single team record',
    description: 'Deletes one team record by its numeric primary key (internal id). This removes a single season entry, not all years for a franchise. To delete by teamID and year, use the id of the corresponding record.',
  })
  @ApiParam({ name: 'id', description: 'Numeric primary key of the team record to delete (one season)' })
  @ApiResponse({ status: 200, description: 'Team record removed' })
  @ApiResponse({ status: 404, description: 'Team not found', type: ErrorDto })
  remove(@Param('id') id: string) {
    return this.teamsService.remove(+id);
  }
}
