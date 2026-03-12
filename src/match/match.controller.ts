import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AuthGuard } from 'src/auth/auth.guard';
import type { AuthorisedRequest } from 'src/auth/auth.types';
import { ErrorDto } from 'src/common/dto/error.dto';
import { DEFAULT_LIMIT, DEFAULT_PAGE } from 'src/common/pagination.dto';
import { CreateMatchDto } from './dto/create-match.dto';
import { MatchQueryDto } from './dto/match-query.dto';
import { MatchResponseDto } from './dto/match-response.dto';
import { PaginatedMatchResponseDto } from './dto/paginated-match-response.dto';
import { MatchService } from './match.service';

@ApiTags('match')
@ApiBearerAuth('defaultBearerAuth')
@Controller('match')
export class MatchController {
  constructor(private readonly matchService: MatchService) {}

  @UseGuards(AuthGuard)
  @Post()
  @ApiOperation({
    summary: 'Play a match between two lineups',
    description:
      'Submit two collections (each with exactly 9 players). A winner is decided (e.g. coin toss) and the result is stored.',
  })
  @ApiResponse({
    status: 201,
    description: 'Match played and result recorded',
    type: MatchResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Validation error or invalid lineups',
    type: ErrorDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized', type: ErrorDto })
  @ApiResponse({
    status: 404,
    description: 'Collection not found',
    type: ErrorDto,
  })
  create(
    @Body() createMatchDto: CreateMatchDto,
    @Req() request: AuthorisedRequest,
  ) {
    return this.matchService.create(createMatchDto, request.user.sub);
  }

  @UseGuards(AuthGuard)
  @Get()
  @ApiOperation({ summary: "List current user's matches (paginated)" })
  @ApiResponse({
    status: 200,
    description: 'Paginated list of matches',
    type: PaginatedMatchResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized', type: ErrorDto })
  findAll(@Req() request: AuthorisedRequest, @Query() query: MatchQueryDto) {
    return this.matchService.findAll(
      request.user.sub,
      query.page ?? DEFAULT_PAGE,
      query.limit ?? DEFAULT_LIMIT,
    );
  }

  @UseGuards(AuthGuard)
  @Get(':id')
  @ApiOperation({ summary: 'Get match by ID' })
  @ApiParam({ name: 'id', description: 'Match ID' })
  @ApiResponse({
    status: 200,
    description: 'Match found',
    type: MatchResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized', type: ErrorDto })
  @ApiResponse({ status: 404, description: 'Match not found', type: ErrorDto })
  findOne(@Param('id') id: string, @Req() request: AuthorisedRequest) {
    return this.matchService.findOne(id, request.user.sub);
  }
}
