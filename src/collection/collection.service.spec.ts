import { Test, TestingModule } from '@nestjs/testing';
import { CollectionService } from './collection.service';
import { CreateCollectionDto } from './dto/create-collection.dto';

describe('CollectionService', () => {
  let service: CollectionService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CollectionService],
    }).compile();

    service = module.get<CollectionService>(CollectionService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create a collection', async () => {
    const createDto: CreateCollectionDto = {
      name: 'My Collection',
      description: 'A collection of my favorite cards',
      playerIDs: [],
    };
    const collection = await service.create(createDto);
    expect(collection).toHaveProperty('id');
    expect(collection.name).toBe(createDto.name);
    expect(collection.description).toBe(createDto.description);
  });
});
