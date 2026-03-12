const STAT_ABBREVIATIONS: Record<string, string> = {
  // Batting / offensive
  runs: 'R',
  atBats: 'AB',
  hits: 'H',
  doubles: '2B',
  triples: '3B',
  homeRuns: 'HR',
  walks: 'BB',
  strikeouts: 'SO',
  stolenBases: 'SB',
  caughtStealing: 'CS',
  hitByPitch: 'HBP',
  sacrificeFlies: 'SF',
  battingAverage: 'BA',
  onBasePercentage: 'OBP',
  sluggingPercentage: 'SLG',

  // Team results / pitching / fielding
  games: 'G',
  gamesHome: 'G (home)',
  wins: 'W',
  losses: 'L',
  runsAllowed: 'RA',
  earnedRuns: 'ER',
  era: 'ERA',
  saves: 'SV',
  hrAllowed: 'HR',
  errors: 'E',
  fieldingPercentage: 'F%',
};

export function formatStatKey(key: string): string {
  const mapped = STAT_ABBREVIATIONS[key];
  if (mapped) return mapped;

  // Fallback: split camelCase to words and title‑case
  return key
    .replace(/([A-Z])/g, ' $1')
    .split(' ')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

