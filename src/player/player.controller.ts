import { Controller } from '@nestjs/common';
import { PlayerService } from './player.service';
import { Get, Param } from '@nestjs/common';
import { Player } from 'generated/prisma/client';

@Controller('player')
export class PlayerController {
  constructor(private readonly playerService: PlayerService) {}

  // @Get(':name')
  // async getName(@Param('name') name: string): Promise<Player[]> {
  //   return await this.playerService.getPlayerByName(name);
  // }

  @Get(':id')
  async getPlayerById(@Param('id') id: string): Promise<Player> {
    return await this.playerService.getPlayerById(id);
  }

  @Get()
  async getAllPlayers(): Promise<Player[]> {
    return await this.playerService.getAllPlayers();
  }
}
