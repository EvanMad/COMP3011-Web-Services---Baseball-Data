import { useEffect, useState } from 'react';
import { leagueLeaders } from 'api/client';
import type { LeagueLeadersResponseDto, LeagueStat } from 'api/types';
import { classNames } from 'utils';
import { formatStatKey } from 'utils/statsLabels';

type Category = 'batting' | 'pitching';

const BATTING_STATS: { id: LeagueStat; label: string }[] = [
  { id: 'homeRuns', label: 'HR' },
  { id: 'hits', label: 'H' },
  { id: 'runs', label: 'R' },
  { id: 'rbi', label: 'RBI' },
  { id: 'stolenBases', label: 'SB' },
  { id: 'walks', label: 'BB' },
  { id: 'battingAverage', label: 'BA' },
  { id: 'onBasePercentage', label: 'OBP' },
  { id: 'sluggingPercentage', label: 'SLG' },
];

const PITCHING_STATS: { id: LeagueStat; label: string }[] = [
  { id: 'wins', label: 'W' },
  { id: 'strikeouts', label: 'SO' },
  { id: 'losses', label: 'L' },
  { id: 'era', label: 'ERA' },
];

export default function LeaderboardsTab() {
  const [category, setCategory] = useState<Category>('batting');
  const [stat, setStat] = useState<LeagueStat>('homeRuns');
  const [year, setYear] = useState('');
  const [league, setLeague] = useState('');
  const [limit, setLimit] = useState('10');

  const [data, setData] = useState<LeagueLeadersResponseDto | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const statsForCategory = category === 'batting' ? BATTING_STATS : PITCHING_STATS;

  useEffect(() => {
    // Reset stat when switching category to a valid default
    if (category === 'batting' && !BATTING_STATS.some((s) => s.id === stat)) {
      setStat('homeRuns');
    }
    if (category === 'pitching' && !PITCHING_STATS.some((s) => s.id === stat)) {
      setStat('wins');
    }
  }, [category, stat]);

  const fetchLeaders = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await leagueLeaders({
        category,
        stat,
        year: year ? parseInt(year, 10) : undefined,
        league: league || undefined,
        limit: limit ? parseInt(limit, 10) : undefined,
      });
      setData(res);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load leaders');
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchLeaders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-slate-200 bg-white p-4">
        <h2 className="text-sm font-semibold text-slate-900">League leaders</h2>
        <p className="mt-1 text-xs text-slate-600">
          Explore the top players in MLB by batting or pitching stats. Optionally filter by year and league (e.g. AL, NL).
        </p>

        <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-1">
            <span className="text-xs font-medium text-slate-600">Category</span>
            <div className="inline-flex rounded border border-slate-300 bg-slate-50 p-0.5">
              {(['batting', 'pitching'] as Category[]).map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setCategory(c)}
                  className={classNames(
                    'px-2 py-1 text-xs font-medium rounded',
                    category === c
                      ? 'bg-indigo-600 text-white'
                      : 'text-slate-700 hover:bg-white'
                  )}
                >
                  {c === 'batting' ? 'Batting' : 'Pitching'}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1">
            <label htmlFor="leaders-stat" className="text-xs font-medium text-slate-600">
              Stat
            </label>
            <select
              id="leaders-stat"
              value={stat}
              onChange={(e) => setStat(e.target.value as LeagueStat)}
              className="w-full rounded border border-slate-300 px-2 py-1.5 text-xs"
            >
              {statsForCategory.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.label} – {formatStatKey(s.id)}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label htmlFor="leaders-year" className="text-xs font-medium text-slate-600">
              Year (optional)
            </label>
            <input
              id="leaders-year"
              type="number"
              min={1871}
              value={year}
              onChange={(e) => setYear(e.target.value)}
              placeholder="e.g. 2024"
              className="w-full rounded border border-slate-300 px-2 py-1.5 text-xs"
            />
          </div>

          <div className="space-y-1">
            <label htmlFor="leaders-league" className="text-xs font-medium text-slate-600">
              League / Limit
            </label>
            <div className="flex gap-2">
              <input
                id="leaders-league"
                type="text"
                value={league}
                onChange={(e) => setLeague(e.target.value.toUpperCase())}
                placeholder="AL / NL"
                className="w-20 rounded border border-slate-300 px-2 py-1.5 text-xs"
              />
              <input
                type="number"
                min={1}
                max={50}
                value={limit}
                onChange={(e) => setLimit(e.target.value)}
                className="w-16 rounded border border-slate-300 px-2 py-1.5 text-xs"
              />
              <button
                type="button"
                onClick={fetchLeaders}
                className="rounded bg-slate-700 px-3 py-1.5 text-xs font-medium text-white hover:bg-slate-800"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white p-4">
        {loading && <p className="text-sm text-slate-500">Loading leaders…</p>}
        {error && !loading && <p className="text-sm text-red-600">{error}</p>}
        {data && !loading && !error && (
          <>
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-600">
              <span>
                {data.category === 'batting' ? 'Batting' : 'Pitching'} leaders for{' '}
                <span className="font-semibold text-slate-900">{formatStatKey(data.stat)}</span>
                {data.year && ` · ${data.year}`}
                {data.league && ` · ${data.league}`}
              </span>
              <span>{data.leaders.length} players</span>
            </div>
            {data.leaders.length === 0 ? (
              <p className="text-sm text-slate-500">No leaders found for this combination.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-600">
                    <tr>
                      <th className="px-3 py-2 font-medium">#</th>
                      <th className="px-3 py-2 font-medium">Player</th>
                      <th className="px-3 py-2 font-medium">ID</th>
                      <th className="px-3 py-2 font-medium text-right">
                        {data.category === 'batting' && ['battingAverage', 'onBasePercentage', 'sluggingPercentage'].includes(
                          data.stat
                        )
                          ? 'Value'
                          : formatStatKey(data.stat)}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {data.leaders.map((l) => (
                      <tr key={l.playerID} className="hover:bg-slate-50">
                        <td className="px-3 py-1.5 text-slate-500">{l.rank}</td>
                        <td className="px-3 py-1.5 text-slate-900">
                          {l.nameFirst} {l.nameLast}
                        </td>
                        <td className="px-3 py-1.5 text-slate-500 font-mono">{l.playerID}</td>
                        <td className="px-3 py-1.5 text-right tabular-nums text-slate-900">
                          {data.category === 'batting' &&
                          ['battingAverage', 'onBasePercentage', 'sluggingPercentage'].includes(data.stat)
                            ? l.value.toFixed(3)
                            : l.value}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

