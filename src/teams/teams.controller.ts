import { Controller, Get, Param, Delete, Query } from '@nestjs/common';
import { TeamsService } from './teams.service';
import { DEFAULT_PAGE, DEFAULT_LIMIT } from 'src/common/pagination.dto';
import { TeamsQueryDto } from './dto/teams-query.dto';

@Controller('teams')
export class TeamsController {
  constructor(private readonly teamsService: TeamsService) {}

  @Get()
  findAll(@Query() query: TeamsQueryDto) {
    return this.teamsService.findAll(
      query.page ?? DEFAULT_PAGE,
      query.limit ?? DEFAULT_LIMIT,
      query.league,
      query.year,
    );
  }

  @Get(':id/:year')
  findOneTeam(@Param('id') id: string, @Param('year') year: number) {
    return this.teamsService.findOne(id, year);
  }

  @Get(':id')
  findAllYears(@Param('id') id: string, @Query() query: TeamsQueryDto) {
    return this.teamsService.findAllTeams(
      id,
      query.page ?? DEFAULT_PAGE,
      query.limit ?? DEFAULT_LIMIT,
      query.year,
    );
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.teamsService.remove(+id);
  }
}
