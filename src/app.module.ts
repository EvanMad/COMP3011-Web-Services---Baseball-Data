import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PlayerController } from './player/player.controller';
import { PlayerModule } from './player/player.module';
import { TeamsModule } from './teams/teams.module';
import { StatsModule } from './stats/stats.module';

@Module({
  imports: [PlayerModule, TeamsModule, StatsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
