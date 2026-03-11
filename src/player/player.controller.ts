import { Delete, Param, Post, Query } from '@nestjs/common';
import { PlayerService } from './player.service';
import { PlayerResponseDto } from './dto/player-response/player-response';
import { AuthGuard } from 'src/auth/auth.guard';
import { UseGuards } from '@nestjs/common';
import { UpdatePlayerDto } from './dto/player-response/update-player.dto';
import { Controller, Body, Patch, Get } from '@nestjs/common';
import { AdminGuard } from 'src/auth/admin.guard';
import { CreatePlayerDto } from './dto/player-response/create-player.dto';
import {
  PaginationQueryDto,
  DEFAULT_PAGE,
  DEFAULT_LIMIT,
} from 'src/common/pagination.dto';

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
    @Query() pagination?: PaginationQueryDto,
  ) {
    const page = pagination?.page ?? DEFAULT_PAGE;
    const limit = pagination?.limit ?? DEFAULT_LIMIT;
    if (name) {
      return await this.playerService.getPlayerByName(name, page, limit);
    }
    return await this.playerService.getAllPlayers(page, limit);
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
