import { Injectable } from '@nestjs/common';
import { CreateCollectionDto } from './dto/create-collection.dto';
import { UpdateCollectionDto } from './dto/update-collection.dto';
import { PrismaService } from '../prisma.service';

@Injectable()
export class CollectionService {
  constructor(private readonly prisma: PrismaService) {}

  create(createCollectionDto: CreateCollectionDto) {
    return this.prisma.collection.create({
      data: createCollectionDto,
    });
  }

  findAll() {
    return this.prisma.collection.findMany();
  }

  findOne(id: string) {
    return this.prisma.collection.findUnique({
      where: { id },
    });
  }

  async update(id: string, updateCollectionDto: UpdateCollectionDto) {
    try {
      return await this.prisma.collection.update({
        where: { id },
        data: updateCollectionDto,
      });
    } catch {
      throw new Error(`Failed to update collection with id ${id}`);
    }
  }

  remove(id: string) {
    return this.prisma.collection.delete({
      where: { id },
    });
  }
}
