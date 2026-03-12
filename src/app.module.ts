import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { McpModule, McpTransportType } from '@rekog/mcp-nest';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PlayerModule } from './player/player.module';
import { PrismaModule } from './prisma.module';
import { StatsModule } from './stats/stats.module';
import { TeamsModule } from './teams/teams.module';
import { CollectionModule } from './collection/collection.module';
import { MatchModule } from './match/match.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { HealthTool } from './mcp/tools/health.tool';
import { LeagueLeadersTool } from './mcp/tools/league-leaders.tool';

@Module({
  imports: [
    McpModule.forRoot({
      name: 'webservices-mcp',
      version: '1.0.0',
      transport: [McpTransportType.STREAMABLE_HTTP],
      streamableHttp: {
        enableJsonResponse: true,
        sessionIdGenerator: undefined,
        statelessMode: true,
      },
    }),
    ThrottlerModule.forRoot({
      throttlers: [
        { name: 'short', ttl: 1000, limit: 10 },
        { name: 'medium', ttl: 10000, limit: 50 },
        { name: 'long', ttl: 60000, limit: 100 },
      ],
      setHeaders: true,
    }),
    PrismaModule,
    PlayerModule,
    TeamsModule,
    StatsModule,
    CollectionModule,
    MatchModule,
    AuthModule,
    UsersModule,
    AnalyticsModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    HealthTool,
    LeagueLeadersTool,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
