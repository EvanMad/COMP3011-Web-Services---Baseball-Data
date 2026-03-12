import { Controller, Delete, Get, Param, Query } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { DEFAULT_LIMIT, DEFAULT_PAGE } from 'src/common/pagination.dto';
import { TeamResponseDto } from './dto/team-response.dto';
import { TeamsQueryDto } from './dto/teams-query.dto';
import { TeamsService } from './teams.service';

@ApiTags('teams')
@Controller('teams')
export class TeamsController {
  constructor(private readonly teamsService: TeamsService) {}

  @Get()
  @ApiOperation({ summary: 'List teams (paginated, optional league/year filters)' })
  @ApiResponse({ status: 200, description: 'Paginated list of teams' })
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
  @ApiResponse({ status: 200, description: 'Team found', type: TeamResponseDto })
  @ApiResponse({ status: 404, description: 'Team not found' })
  findOneTeam(@Param('id') id: string, @Param('year') year: number) {
    return this.teamsService.findOne(id, year);
  }

  @Get(':id')
  @ApiOperation({ summary: 'List all years for a team (paginated)' })
  @ApiParam({ name: 'id', description: 'Team ID' })
  @ApiResponse({ status: 200, description: 'Paginated list of team records by year' })
  findAllYears(@Param('id') id: string, @Query() query: TeamsQueryDto) {
    return this.teamsService.findAllTeams(
      id,
      query.page ?? DEFAULT_PAGE,
      query.limit ?? DEFAULT_LIMIT,
      query.year,
    );
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remove team by ID' })
  @ApiParam({ name: 'id', description: 'Team ID' })
  @ApiResponse({ status: 200, description: 'Team removed' })
  @ApiResponse({ status: 404, description: 'Team not found' })
  remove(@Param('id') id: string) {
    return this.teamsService.remove(+id);
  }
}
