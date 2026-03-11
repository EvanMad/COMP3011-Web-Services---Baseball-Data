import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateCollectionDto } from './dto/create-collection.dto';
import { UpdateCollectionDto } from './dto/update-collection.dto';
import { PrismaService } from '../prisma.service';
import {
  getPaginationParams,
  paginate,
  PaginatedResponse,
} from 'src/common/pagination.dto';

@Injectable()
export class CollectionService {
  constructor(private readonly prisma: PrismaService) {}

  create(createCollectionDto: CreateCollectionDto, userId: string) {
    return this.prisma.collection.create({
      data: {
        ...createCollectionDto,
        userId: userId,
      },
    });
  }

  async findAll(
    userId: string,
    page: number = 1,
    limit: number = 20,
    name?: string,
  ): Promise<
    PaginatedResponse<{
      id: string;
      name: string;
      description: string | null;
      playerIDs: string[];
      createdAt: Date;
      updatedAt: Date;
      userId: string;
    }>
  > {
    const { skip, take } = getPaginationParams(page, limit);
    const where = this.buildCollectionWhere(userId, name);
    const [data, total] = await Promise.all([
      this.prisma.collection.findMany({
        where,
        skip,
        take,
        orderBy: { updatedAt: 'desc' },
      }),
      this.prisma.collection.count({ where }),
    ]);
    return paginate(data, total, page, limit);
  }

  private buildCollectionWhere(userId: string, name?: string) {
    const where: {
      userId: string;
      name?: { contains: string; mode: 'insensitive' };
    } = { userId };
    if (name !== undefined && name.trim() !== '') {
      where.name = { contains: name, mode: 'insensitive' };
    }
    return where;
  }

  async findOne(id: string, userId: string) {
    const collection = await this.prisma.collection.findFirst({
      where: { id, userId },
    });
    if (!collection) {
      throw new NotFoundException('Collection not found');
    }
    return collection;
  }

  async update(
    id: string,
    userId: string,
    updateCollectionDto: UpdateCollectionDto,
  ) {
    const collection = await this.prisma.collection.findFirst({
      where: { id, userId },
    });
    if (!collection) {
      throw new NotFoundException('Collection not found');
    }
    return this.prisma.collection.update({
      where: { id },
      data: updateCollectionDto,
    });
  }

  async remove(id: string, userId: string) {
    const collection = await this.prisma.collection.findFirst({
      where: { id, userId },
    });
    if (!collection) {
      throw new NotFoundException('Collection not found');
    }
    return this.prisma.collection.delete({
      where: { id },
    });
  }
}
