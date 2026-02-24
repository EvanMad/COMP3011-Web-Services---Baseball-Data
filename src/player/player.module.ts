import { Module } from '@nestjs/common';
import { PlayerController } from './player.controller';
import { PlayerService } from './player.service';
import { Prisma } from 'generated/prisma/client';
import { PrismaService } from 'src/prisma.service';
import { StatsModule } from 'src/stats/stats.module';

@Module({
  controllers: [PlayerController],
  providers: [PlayerService, PrismaService],
  imports: [StatsModule],
})
export class PlayerModule {}
