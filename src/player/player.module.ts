import { Module } from '@nestjs/common';
import { PlayerController } from './player.controller';
import { PlayerService } from './player.service';
import { StatsModule } from 'src/stats/stats.module';

@Module({
  controllers: [PlayerController],
  providers: [PlayerService],
  imports: [StatsModule],
})
export class PlayerModule {}
