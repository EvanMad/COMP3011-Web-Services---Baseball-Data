/** API types matching backend DTOs (see OpenAPI at /api) */

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface PlayerResponseDto {
  playerID: string;
  nameFirst: string;
  nameLast: string;
  birthCountry: string;
  weight: number;
  height: number;
  career_batting?: { battingAverage: number; onBasePercentage: number; sluggingPercentage: number };
  careerHighs?: { HR: number; H: number };
  career_pitching?: { wins: number; losses: number; strikeouts: number; averageEra: number };
}

export interface PaginatedPlayerResponseDto {
  data: PlayerResponseDto[];
  meta: PaginationMeta;
}

export interface TeamResponseDto {
  yearID: number;
  teamID: string;
  name: string;
  league: string;
  franchiseID: string;
  divisionID?: string;
  park?: string;
  attendance?: number;
  results: { rank: number; divisionWin: boolean; wildCardWin: boolean; leagueWin: boolean; worldSeriesWin: boolean };
  batting: Record<string, number>;
  pitching: Record<string, number>;
}

export interface PaginatedTeamResponseDto {
  data: TeamResponseDto[];
  meta: PaginationMeta;
}

export interface CollectionResponseDto {
  id: string;
  name: string;
  description: string | null;
  playerIDs: string[];
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedCollectionResponseDto {
  data: CollectionResponseDto[];
  meta: PaginationMeta;
}

export interface CreateCollectionDto {
  name: string;
  description?: string;
  playerIDs: string[];
}

export interface UpdateCollectionDto {
  name?: string;
  description?: string;
  playerIDs?: string[];
}

export interface AuthResponseDto {
  access_token: string;
}

export interface ErrorDto {
  statusCode: number;
  error: string;
  message: string;
  errors?: unknown[];
}
