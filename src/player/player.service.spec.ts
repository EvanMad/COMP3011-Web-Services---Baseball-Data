import { Test, TestingModule } from '@nestjs/testing';
import { PlayerService } from './player.service';
import { PrismaService } from '../prisma.service';
import { StatsService } from '../stats/stats.service';
import { mockDeep, DeepMockProxy } from 'jest-mock-extended';
import { Player, PrismaClient } from '../../generated/prisma/client';
import { CreatePlayerDto } from './dto/player-response/create-player.dto';

describe('PlayerService', () => {
  let service: PlayerService;
  let prismaMock: DeepMockProxy<PrismaClient>;

  beforeEach(async () => {
    // 1. Create a deep mock of the Prisma Client
    prismaMock = mockDeep<PrismaClient>();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PlayerService,
        StatsService, // You can provide the real one if it's a "pure" utility service
        {
          provide: PrismaService,
          useValue: prismaMock, // Use the mock instead of the real service
        },
      ],
    }).compile();

    service = module.get<PlayerService>(PlayerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create a player and return the mapped DTO', async () => {
    // 1. Arrange
    const inputDto: CreatePlayerDto = {
      playerID: 'test-001',
      nameFirst: 'Joe',
      nameLast: 'Bloggs',
      weight: 180,
      height: 72,
    };

    const dbResponse: Player = {
      id: 1,
      ...inputDto,
      dateOfBirth: null,
      dateOfDeath: null,
      birthCountry: 'USA', // Testing that mapping works
      bats: 'R',
      throws: 'R',
      collectionId: null,
    };

    // Mock the check for existing player (your service does this first)
    prismaMock.player.findUnique.mockResolvedValue(null);
    // Mock the actual creation
    prismaMock.player.create.mockResolvedValue(dbResponse);

    // 2. Act
    const result = await service.createPlayer(inputDto);

    // 3. Assert
    expect(result.playerID).toBe('test-001');
    expect(result.birthCountry).toBe('USA'); // Verify mapping logic
  });

  it('should throw NotFoundException if player to create already exists', async () => {
    // Arrange
    const inputDto: CreatePlayerDto = {
      playerID: 'test-001',
      nameFirst: 'Joe',
      nameLast: 'Bloggs',
      weight: 180,
      height: 72,
    };

    // Mock that the player already exists
    prismaMock.player.findUnique.mockResolvedValue({
      id: 1,
      ...inputDto,
      dateOfBirth: null,
      dateOfDeath: null,
      birthCountry: 'USA',
      bats: 'R',
      throws: 'R',
      collectionId: null,
    });

    // Act & Assert
    await expect(service.createPlayer(inputDto)).rejects.toThrow(
      `Player with id ${inputDto.playerID} already exists`,
    );
  });

  it('should throw NotFoundException if player to delete does not exist', async () => {
    // Arrange
    prismaMock.player.findUnique.mockResolvedValue(null);

    // Act & Assert
    await expect(service.deletePlayer('non-existent-id')).rejects.toThrow(
      `Player with id non-existent-id not found`,
    );
  });
});
