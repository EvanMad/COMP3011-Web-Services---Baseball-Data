import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Req,
} from '@nestjs/common';
import { CollectionService } from './collection.service';
import { CreateCollectionDto } from './dto/create-collection.dto';
import { UpdateCollectionDto } from './dto/update-collection.dto';
import { AuthGuard } from 'src/auth/auth.guard';
import type { AuthorisedRequest } from 'src/auth/auth.types';
import { UseGuards } from '@nestjs/common';

@Controller('collection')
export class CollectionController {
  constructor(private readonly collectionService: CollectionService) {}

  @UseGuards(AuthGuard)
  @Post()
  create(
    @Body() createCollectionDto: CreateCollectionDto,
    @Req() request: AuthorisedRequest,
  ) {
    const userID: string = request.user.sub;
    return this.collectionService.create(createCollectionDto, userID);
  }

  @UseGuards(AuthGuard)
  @Get()
  findAll(@Req() request: AuthorisedRequest) {
    return this.collectionService.findAll(request.user.sub);
  }

  @UseGuards(AuthGuard)
  @Get(':id')
  findOne(@Param('id') id: string, @Req() request: AuthorisedRequest) {
    return this.collectionService.findOne(id, request.user.sub);
  }

  @UseGuards(AuthGuard)
  @Patch(':id')
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
  remove(@Param('id') id: string, @Req() request: AuthorisedRequest) {
    return this.collectionService.remove(id, request.user.sub);
  }
}
