import { Module } from '@nestjs/common';
import { TeamsService } from './teams.service';
import { TeamsController } from './teams.controller';
import { StatsModule } from 'src/stats/stats.module';

@Module({
  controllers: [TeamsController],
  providers: [TeamsService],
  imports: [StatsModule],
  exports: [TeamsService],
})
export class TeamsModule {}
