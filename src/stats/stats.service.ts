import { Injectable } from '@nestjs/common';

@Injectable()
export class StatsService {
  calculateBattingAverage(hits: number, atBats: number): number {
    if (atBats === 0) {
      return 0;
    }
    const ba = parseFloat((hits / atBats).toFixed(3));
    return ba;
  }

  calculateOnBasePercentage(
    hits: number,
    walks: number,
    hitByPitch: number,
    atBats: number,
    sacrificeFlies: number,
  ): number {
    const onbases = hits + walks + hitByPitch;
    const pa = atBats + walks + hitByPitch + sacrificeFlies;
    const onBasePercentage = pa > 0 ? parseFloat((onbases / pa).toFixed(3)) : 0;
    return onBasePercentage;    
  }

  calculateTotalBases(
    hits: number,
    doubles: number,
    triples: number,
    homeRuns: number,
  ): number {
    const totalBases =
      hits - doubles - triples - homeRuns + 2 * doubles + 3 * triples + 4 * homeRuns;
    return totalBases;
  }

  calculateSluggingPercentage(totalBases: number, atBats: number): number {
    if (atBats === 0) {
      return 0;
    }
    const sluggingPercentage = parseFloat((totalBases / atBats).toFixed(3));
    return sluggingPercentage;
  }
}
