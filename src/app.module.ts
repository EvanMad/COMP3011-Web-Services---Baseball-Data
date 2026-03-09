import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PlayerModule } from './player/player.module';
import { PrismaModule } from './prisma.module';
import { StatsModule } from './stats/stats.module';
import { TeamsModule } from './teams/teams.module';

@Module({
  imports: [PrismaModule, PlayerModule, TeamsModule, StatsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
