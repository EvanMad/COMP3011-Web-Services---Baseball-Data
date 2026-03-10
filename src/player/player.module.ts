import { Module } from '@nestjs/common';
import { PlayerController } from './player.controller';
import { PlayerService } from './player.service';
import { StatsModule } from 'src/stats/stats.module';
import { AuthModule } from 'src/auth/auth.module';
import { UsersModule } from 'src/users/users.module';

@Module({
  controllers: [PlayerController],
  providers: [PlayerService],
  imports: [StatsModule, AuthModule, UsersModule],
})
export class PlayerModule {}
