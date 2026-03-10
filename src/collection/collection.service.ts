import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateCollectionDto } from './dto/create-collection.dto';
import { UpdateCollectionDto } from './dto/update-collection.dto';
import { PrismaService } from '../prisma.service';

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

  findAll(userId: string) {
    return this.prisma.collection.findMany({
      where: { userId },
    });
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
