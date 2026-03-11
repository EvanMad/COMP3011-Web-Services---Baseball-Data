import { Controller, Get, Param, Delete, Query } from '@nestjs/common';
import { TeamsService } from './teams.service';
import {
  PaginationQueryDto,
  DEFAULT_PAGE,
  DEFAULT_LIMIT,
} from 'src/common/pagination.dto';

@Controller('teams')
export class TeamsController {
  constructor(private readonly teamsService: TeamsService) {}

  @Get()
  findAll(@Query() pagination: PaginationQueryDto) {
    return this.teamsService.findAll(
      pagination.page ?? DEFAULT_PAGE,
      pagination.limit ?? DEFAULT_LIMIT,
    );
  }

  @Get(':id/:year')
  findOneTeam(@Param('id') id: string, @Param('year') year: number) {
    return this.teamsService.findOne(id, year);
  }

  @Get(':id')
  findAllYears(
    @Param('id') id: string,
    @Query() pagination: PaginationQueryDto,
  ) {
    return this.teamsService.findAllTeams(
      id,
      pagination.page ?? DEFAULT_PAGE,
      pagination.limit ?? DEFAULT_LIMIT,
    );
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.teamsService.remove(+id);
  }
}
