import { Module } from '@nestjs/common';
import { TeamsService } from './teams.service';
import { TeamsController } from './teams.controller';
import { StatsModule } from 'src/stats/stats.module';

@Module({
  controllers: [TeamsController],
  providers: [TeamsService],
  imports: [StatsModule],
})
export class TeamsModule {}
