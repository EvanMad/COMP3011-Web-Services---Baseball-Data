import { Test, TestingModule } from '@nestjs/testing';
import { StatsService } from './stats.service';

describe('StatsService', () => {
  let service: StatsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [StatsService],
    }).compile();

    service = module.get<StatsService>(StatsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('calculateBattingAverage', () => {
    it('should return 0 when atBats is 0', () => {
      expect(service.calculateBattingAverage(0, 0)).toBe(0);
      expect(service.calculateBattingAverage(5, 0)).toBe(0);
    });

    it('should return hits/atBats rounded to 3 decimals', () => {
      expect(service.calculateBattingAverage(1, 4)).toBe(0.25);
      expect(service.calculateBattingAverage(3, 10)).toBe(0.3);
      expect(service.calculateBattingAverage(100, 400)).toBe(0.25);
      expect(service.calculateBattingAverage(1, 3)).toBe(0.333);
    });
  });

  describe('calculateOnBasePercentage', () => {
    it('should return 0 when plate appearances is 0', () => {
      expect(
        service.calculateOnBasePercentage(0, 0, 0, 0, 0),
      ).toBe(0);
    });

    it('should compute (hits + walks + hbp) / (ab + walks + hbp + sf)', () => {
      // 1 hit, 1 walk, 2 AB, 0 HBP, 0 SF -> 2 on base, 3 PA
      expect(
        service.calculateOnBasePercentage(1, 1, 0, 2, 0),
      ).toBe(0.667);
      expect(
        service.calculateOnBasePercentage(2, 1, 1, 5, 0),
      ).toBe(0.571); // 4/7
    });
  });

  describe('calculateTotalBases', () => {
    it('should count singles as 1, doubles 2, triples 3, HR 4', () => {
      // singles = hits - doubles - triples - homeRuns
      expect(service.calculateTotalBases(10, 2, 1, 1)).toBe(
        10 - 2 - 1 - 1 + 2 * 2 + 3 * 1 + 4 * 1,
      );
      expect(service.calculateTotalBases(10, 2, 1, 1)).toBe(6 + 4 + 3 + 4);
    });

    it('should return 0 for all zeros', () => {
      expect(service.calculateTotalBases(0, 0, 0, 0)).toBe(0);
    });
  });

  describe('calculateSluggingPercentage', () => {
    it('should return 0 when atBats is 0', () => {
      expect(service.calculateSluggingPercentage(10, 0)).toBe(0);
    });

    it('should return totalBases/atBats to 3 decimals', () => {
      expect(service.calculateSluggingPercentage(10, 20)).toBe(0.5);
      expect(service.calculateSluggingPercentage(15, 40)).toBe(0.375);
    });
  });
});
