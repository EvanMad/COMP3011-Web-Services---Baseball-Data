import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class PlayerService {
  constructor(private readonly prisma: PrismaService) {}

  async getName(id: number): Promise<string> {
    const player = await this.prisma.player.findUnique({
      where: {
        id: id,
      },
    });
    if (!player) {
      throw new NotFoundException(`Player with id ${id} not found`);
    }
    return player.name;
  }
}
