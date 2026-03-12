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
import { ApiBearerAuth, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from 'src/auth/auth.guard';
import type { AuthorisedRequest } from 'src/auth/auth.types';
import { DEFAULT_LIMIT, DEFAULT_PAGE } from 'src/common/pagination.dto';
import { CollectionService } from './collection.service';
import { CreateCollectionDto } from './dto/create-collection.dto';
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
  @ApiResponse({ status: 201, description: 'Collection created' })
  @ApiResponse({ status: 400, description: 'Validation error' })
  create(
    @Body() createCollectionDto: CreateCollectionDto,
    @Req() request: AuthorisedRequest,
  ) {
    const userId: string = request.user.sub;
    return this.collectionService.create(createCollectionDto, userId);
  }

  @UseGuards(AuthGuard)
  @Get()
  @ApiOperation({ summary: 'List current user\'s collections (paginated)' })
  @ApiResponse({ status: 200, description: 'Paginated list of collections' })
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
  @ApiResponse({ status: 200, description: 'Collection found' })
  @ApiResponse({ status: 404, description: 'Collection not found' })
  findOne(@Param('id') id: string, @Req() request: AuthorisedRequest) {
    return this.collectionService.findOne(id, request.user.sub);
  }

  @UseGuards(AuthGuard)
  @Patch(':id')
  @ApiOperation({ summary: 'Update collection' })
  @ApiParam({ name: 'id', description: 'Collection ID' })
  @ApiResponse({ status: 200, description: 'Collection updated' })
  @ApiResponse({ status: 404, description: 'Collection not found' })
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
  @ApiResponse({ status: 404, description: 'Collection not found' })
  remove(@Param('id') id: string, @Req() request: AuthorisedRequest) {
    return this.collectionService.remove(id, request.user.sub);
  }
}
