import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
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
import { CollectionService } from './collection.service';
import { CollectionResponseDto } from './dto/collection-response.dto';
import { CreateCollectionDto } from './dto/create-collection.dto';
import { PaginatedCollectionResponseDto } from './dto/paginated-collection-response.dto';
import { UpdateCollectionDto } from './dto/update-collection.dto';
import { CollectionQueryDto } from './dto/collection-query.dto';

@ApiTags('collection')
@ApiBearerAuth('defaultBearerAuth')
@Controller('collection')
export class CollectionController {
  constructor(private readonly collectionService: CollectionService) {}

  @UseGuards(AuthGuard)
  @Post()
  @ApiOperation({ summary: 'Create a collection' })
  @ApiResponse({
    status: 201,
    description: 'Collection created',
    type: () => CollectionResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Validation error', type: ErrorDto })
  @ApiResponse({ status: 401, description: 'Unauthorized', type: ErrorDto })
  create(
    @Body() createCollectionDto: CreateCollectionDto,
    @Req() request: AuthorisedRequest,
  ) {
    const userId: string = request.user.sub;
    return this.collectionService.create(createCollectionDto, userId);
  }

  @UseGuards(AuthGuard)
  @Get()
  @ApiOperation({ summary: "List current user's collections (paginated)" })
  @ApiResponse({
    status: 200,
    description: 'Paginated list of collections',
    type: () => PaginatedCollectionResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized', type: ErrorDto })
  findAll(
    @Req() request: AuthorisedRequest,
    @Query() query: CollectionQueryDto,
  ) {
    return this.collectionService.findAll(
      request.user.sub,
      query.page ?? DEFAULT_PAGE,
      query.limit ?? DEFAULT_LIMIT,
      query.name,
    );
  }

  @UseGuards(AuthGuard)
  @Get(':id')
  @ApiOperation({ summary: 'Get collection by ID' })
  @ApiParam({ name: 'id', description: 'Collection ID' })
  @ApiResponse({
    status: 200,
    description: 'Collection found',
    type: () => CollectionResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized', type: ErrorDto })
  @ApiResponse({
    status: 404,
    description: 'Collection not found',
    type: ErrorDto,
  })
  findOne(@Param('id') id: string, @Req() request: AuthorisedRequest) {
    return this.collectionService.findOne(id, request.user.sub);
  }

  @UseGuards(AuthGuard)
  @Patch(':id')
  @ApiOperation({ summary: 'Update collection' })
  @ApiParam({ name: 'id', description: 'Collection ID' })
  @ApiResponse({
    status: 200,
    description: 'Collection updated',
    type: () => CollectionResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Validation error', type: ErrorDto })
  @ApiResponse({ status: 401, description: 'Unauthorized', type: ErrorDto })
  @ApiResponse({
    status: 404,
    description: 'Collection not found',
    type: ErrorDto,
  })
  update(
    @Param('id') id: string,
    @Body() updateCollectionDto: UpdateCollectionDto,
    @Req() request: AuthorisedRequest,
  ) {
    return this.collectionService.update(
      id,
      request.user.sub,
      updateCollectionDto,
    );
  }

  @UseGuards(AuthGuard)
  @Delete(':id')
  @ApiOperation({ summary: 'Delete collection' })
  @ApiParam({ name: 'id', description: 'Collection ID' })
  @ApiResponse({ status: 200, description: 'Collection deleted' })
  @ApiResponse({ status: 401, description: 'Unauthorized', type: ErrorDto })
  @ApiResponse({
    status: 404,
    description: 'Collection not found',
    type: ErrorDto,
  })
  remove(@Param('id') id: string, @Req() request: AuthorisedRequest) {
    return this.collectionService.remove(id, request.user.sub);
  }
}
