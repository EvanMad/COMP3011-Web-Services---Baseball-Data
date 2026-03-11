import { Delete, Param, Post, Query } from '@nestjs/common';
import { PlayerService } from './player.service';
import { PlayerResponseDto } from './dto/player-response/player-response';
import { AuthGuard } from 'src/auth/auth.guard';
import { UseGuards } from '@nestjs/common';
import { UpdatePlayerDto } from './dto/player-response/update-player.dto';
import { Controller, Body, Patch, Get } from '@nestjs/common';
import { AdminGuard } from 'src/auth/admin.guard';
import { CreatePlayerDto } from './dto/player-response/create-player.dto';
import { DEFAULT_PAGE, DEFAULT_LIMIT } from 'src/common/pagination.dto';
import { PlayerQueryDto } from './dto/player-query.dto';

@Controller('player')
export class PlayerController {
  constructor(private readonly playerService: PlayerService) {}

  @Get(':id')
  async getPlayerById(@Param('id') id: string): Promise<PlayerResponseDto> {
    return await this.playerService.getPlayerById(id);
  }

  @UseGuards(AuthGuard)
  @Get()
  async getAllPlayers(@Query() query: PlayerQueryDto) {
    return await this.playerService.findAll(
      query.page ?? DEFAULT_PAGE,
      query.limit ?? DEFAULT_LIMIT,
      query.name,
      query.birthCountry,
    );
  }

  @UseGuards(AdminGuard)
  @Patch(':id')
  async updatePlayer(
    @Param('id') id: string,
    @Body() updatePlayerDto: UpdatePlayerDto,
  ): Promise<PlayerResponseDto> {
    return await this.playerService.updatePlayer(id, updatePlayerDto);
  }

  @UseGuards(AdminGuard)
  @Delete(':id')
  async deletePlayer(@Param('id') id: string): Promise<void> {
    await this.playerService.deletePlayer(id);
  }

  @UseGuards(AdminGuard)
  @Post()
  async createPlayer(
    @Body() createPlayerDto: CreatePlayerDto,
  ): Promise<PlayerResponseDto> {
    return await this.playerService.createPlayer(createPlayerDto);
  }
}
