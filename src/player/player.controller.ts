import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AdminGuard } from 'src/auth/admin.guard';
import { ErrorDto } from 'src/common/dto/error.dto';
import { DEFAULT_LIMIT, DEFAULT_PAGE } from 'src/common/pagination.dto';
import { CreatePlayerDto } from './dto/player-response/create-player.dto';
import { PaginatedPlayerResponseDto } from './dto/player-response/paginated-player-response.dto';
import { PlayerResponseDto } from './dto/player-response/player-response';
import { UpdatePlayerDto } from './dto/player-response/update-player.dto';
import { PlayerQueryDto } from './dto/player-query.dto';
import { PlayerService } from './player.service';

@ApiTags('player')
@Controller('player')
export class PlayerController {
  constructor(private readonly playerService: PlayerService) {}

  @Get(':id')
  @ApiOperation({ summary: 'Get player by ID' })
  @ApiParam({ name: 'id', description: 'Player ID' })
  @ApiResponse({
    status: 200,
    description: 'Player found',
    type: () => PlayerResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Player not found', type: ErrorDto })
  async getPlayerById(@Param('id') id: string): Promise<PlayerResponseDto> {
    return await this.playerService.getPlayerById(id);
  }

  @Get()
  @ApiBearerAuth('defaultBearerAuth')
  @ApiOperation({ summary: 'List players (paginated, optional filters)' })
  @ApiResponse({
    status: 200,
    description: 'Paginated list of players',
    type: () => PaginatedPlayerResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized', type: ErrorDto })
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
  @ApiBearerAuth('defaultBearerAuth')
  @ApiOperation({ summary: 'Update player (admin)' })
  @ApiParam({ name: 'id', description: 'Player ID' })
  @ApiResponse({
    status: 200,
    description: 'Updated player',
    type: () => PlayerResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Validation error', type: ErrorDto })
  @ApiResponse({ status: 401, description: 'Unauthorized', type: ErrorDto })
  @ApiResponse({ status: 404, description: 'Player not found', type: ErrorDto })
  async updatePlayer(
    @Param('id') id: string,
    @Body() updatePlayerDto: UpdatePlayerDto,
  ): Promise<PlayerResponseDto> {
    return await this.playerService.updatePlayer(id, updatePlayerDto);
  }

  @UseGuards(AdminGuard)
  @Delete(':id')
  @ApiBearerAuth('defaultBearerAuth')
  @ApiOperation({ summary: 'Delete player (admin)' })
  @ApiParam({ name: 'id', description: 'Player ID' })
  @ApiResponse({ status: 200, description: 'Player deleted' })
  @ApiResponse({ status: 401, description: 'Unauthorized', type: ErrorDto })
  @ApiResponse({ status: 404, description: 'Player not found', type: ErrorDto })
  async deletePlayer(@Param('id') id: string): Promise<void> {
    await this.playerService.deletePlayer(id);
  }

  @UseGuards(AdminGuard)
  @Post()
  @ApiBearerAuth('defaultBearerAuth')
  @ApiOperation({ summary: 'Create player (admin)' })
  @ApiResponse({
    status: 201,
    description: 'Player created',
    type: () => PlayerResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Validation error', type: ErrorDto })
  @ApiResponse({ status: 401, description: 'Unauthorized', type: ErrorDto })
  async createPlayer(
    @Body() createPlayerDto: CreatePlayerDto,
  ): Promise<PlayerResponseDto> {
    return await this.playerService.createPlayer(createPlayerDto);
  }
}
