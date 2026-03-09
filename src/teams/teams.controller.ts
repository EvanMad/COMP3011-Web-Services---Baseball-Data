import { Controller, Get, Param, Delete } from '@nestjs/common';
import { TeamsService } from './teams.service';
@Controller('teams')
export class TeamsController {
  constructor(private readonly teamsService: TeamsService) {}

  @Get()
  findAll() {
    return this.teamsService.findAll();
  }

  @Get(':id/:year')
  findOneTeam(@Param('id') id: string, @Param('year') year: number) {
    return this.teamsService.findOne(id, year);
  }

  @Get(':id')
  findAllYears(@Param('id') id: string) {
    return this.teamsService.findAllTeams(id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.teamsService.remove(+id);
  }
}
