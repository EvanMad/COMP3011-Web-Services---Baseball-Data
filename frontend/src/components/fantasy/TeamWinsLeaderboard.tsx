import { useEffect, useState } from 'react';
import { teamsList } from 'api/client';
import type { TeamResponseDto } from 'api/types';

const CURRENT_YEAR = new Date().getFullYear();
const TOP_N = 10;

function getWins(team: TeamResponseDto): number {
  if (team.results?.wins != null) return team.results.wins;
  const b = team.batting;
  if (b && typeof b === 'object' && 'wins' in b && typeof (b as Record<string, number>).wins === 'number') {
    return (b as Record<string, number>).wins;
  }
  return 0;
}

export default function TeamWinsLeaderboard() {
  const [year, setYear] = useState(String(CURRENT_YEAR));
  const [league, setLeague] = useState('');
  const [teams, setTeams] = useState<TeamResponseDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const yearNum = year ? parseInt(year, 10) : CURRENT_YEAR;
    if (Number.isNaN(yearNum) || yearNum < 1871) {
      setTeams([]);
      return;
    }
    setLoading(true);
    setError(null);
    teamsList({
      year: yearNum,
      league: league.trim() || undefined,
      limit: 100,
    })
      .then((res) => {
        const sorted = [...res.data].sort((a, b) => getWins(b) - getWins(a));
        setTeams(sorted.slice(0, TOP_N));
      })
      .catch((e) => {
        setError(e instanceof Error ? e.message : 'Failed to load teams');
        setTeams([]);
      })
      .finally(() => setLoading(false));
  }, [year, league]);

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <h3 className="text-sm font-semibold text-slate-900">Team wins leaderboard</h3>
      <p className="mt-1 text-xs text-slate-600">
        Top {TOP_N} MLB teams by wins. Filter by year and league (e.g. AL, NL).
      </p>

      <div className="mt-3 flex flex-wrap items-end gap-3">
        <div className="space-y-1">
          <label htmlFor="team-wins-year" className="block text-xs font-medium text-slate-600">
            Year
          </label>
          <input
            id="team-wins-year"
            type="number"
            min={1871}
            value={year}
            onChange={(e) => setYear(e.target.value)}
            className="w-24 rounded border border-slate-300 px-2 py-1.5 text-sm"
          />
        </div>
        <div className="space-y-1">
          <label htmlFor="team-wins-league" className="block text-xs font-medium text-slate-600">
            League
          </label>
          <input
            id="team-wins-league"
            type="text"
            value={league}
            onChange={(e) => setLeague(e.target.value.toUpperCase())}
            placeholder="AL / NL"
            className="w-20 rounded border border-slate-300 px-2 py-1.5 text-sm"
          />
        </div>
      </div>

      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
      {loading && <p className="mt-2 text-sm text-slate-500">Loading…</p>}
      {!loading && teams.length === 0 && !error && (
        <p className="mt-2 text-sm text-slate-500">No teams found.</p>
      )}
      {!loading && teams.length > 0 && (
        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-slate-600">
                <th className="pb-2 pr-4 font-medium">#</th>
                <th className="pb-2 pr-4 font-medium">Team</th>
                <th className="pb-2 pr-4 font-medium">Year</th>
                <th className="pb-2 pr-4 font-medium">League</th>
                <th className="pb-2 pr-4 font-medium text-right">W</th>
                <th className="pb-2 font-medium text-right">L</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {teams.map((team, index) => (
                <tr key={`${team.teamID}-${team.yearID}`} className="hover:bg-slate-50">
                  <td className="py-2 pr-4 text-slate-500">{index + 1}</td>
                  <td className="py-2 pr-4 font-medium text-slate-900">{team.name}</td>
                  <td className="py-2 pr-4 text-slate-600">{team.yearID}</td>
                  <td className="py-2 pr-4 text-slate-600">{team.league}</td>
                  <td className="py-2 pr-4 text-right tabular-nums font-medium text-slate-900">
                    {getWins(team)}
                  </td>
                  <td className="py-2 text-right tabular-nums text-slate-600">
                    {team.results?.losses ?? team.batting?.losses ?? '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
