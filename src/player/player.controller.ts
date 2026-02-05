import { Controller } from '@nestjs/common';
import { PlayerService } from './player.service';
import { Get, Param } from '@nestjs/common';

@Controller('player')
export class PlayerController {
  constructor(private readonly playerService: PlayerService) {}

  @Get(':name')
  async getName(@Param('name') id: number): Promise<string> {
    return await this.playerService.getName(id);
  }
}
