export class CareerBattingDto {
  battingAverage!: number;
  onBasePercentage!: number;
  sluggingPercentage!: number;
}

export class PlayerResponseDto {
  playerID!: string;
  nameFirst!: string;
  nameLast!: string;
  birthCountry!: string;
  weight!: number;
  height!: number;
  career_batting!: CareerBattingDto;
  careerHighs!: {
    HR: number;
    H: number;
  };
}