import { Delete, Param, Post, Query } from '@nestjs/common';
import { PlayerService } from './player.service';
import { Get } from '@nestjs/common';
import { PlayerResponseDto } from './dto/player-response/player-response';
import { AuthGuard } from 'src/auth/auth.guard';
import { UseGuards } from '@nestjs/common';
import { UpdatePlayerDto } from './dto/player-response/update-player.dto';
import { Controller, Body, Patch } from '@nestjs/common';
import { AdminGuard } from 'src/auth/admin.guard';
import { CreatePlayerDto } from './dto/player-response/create-player.dto';

@Controller('player')
export class PlayerController {
  constructor(private readonly playerService: PlayerService) {}

  @Get(':id')
  async getPlayerById(@Param('id') id: string): Promise<PlayerResponseDto> {
    return await this.playerService.getPlayerById(id);
  }

  @UseGuards(AuthGuard)
  @Get()
  async getAllPlayers(
    @Query('name') name?: string,
  ): Promise<PlayerResponseDto[]> {
    if (name) {
      return await this.playerService.getPlayerByName(name);
    } else {
      // If no name query parameter is provided, return all players
      return await this.playerService.getAllPlayers();
    }
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
