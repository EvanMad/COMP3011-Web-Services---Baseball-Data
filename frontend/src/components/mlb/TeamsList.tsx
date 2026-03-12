import { useEffect, useState } from 'react';
import { teamByIdYear, teamsList } from 'api/client';
import type { TeamResponseDto } from 'api/types';
import { formatStatKey } from 'utils/statsLabels';

function teamKey(t: TeamResponseDto) {
  return `${t.teamID}-${t.yearID}`;
}

function TeamDrawer({ team, onClose }: { team: TeamResponseDto; onClose: () => void }) {
  const { results, batting, pitching, park, attendance, divisionID } = team;
  const battingEntries = batting && typeof batting === 'object' ? Object.entries(batting) : [];
  const pitchingEntries = pitching && typeof pitching === 'object' ? Object.entries(pitching) : [];

  return (
    <div className="border-t border-slate-200 bg-slate-50/80">
      <div className="flex items-center justify-between px-4 py-2">
        <span className="text-xs font-medium uppercase tracking-wide text-slate-500">Team details</span>
        <button
          type="button"
          onClick={onClose}
          className="text-slate-500 hover:text-slate-700 text-sm"
          aria-label="Close"
        >
          Close
        </button>
      </div>
      <div className="px-4 pb-4 pt-0 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {/* Results */}
        {results && (
          <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <h4 className="mb-3 text-sm font-semibold text-slate-800">Season results</h4>
            <dl className="space-y-1.5 text-sm">
              <div className="flex justify-between">
                <dt className="text-slate-500">Rank</dt>
                <dd className="font-medium text-slate-900">{results.rank ?? '—'}</dd>
              </div>
              {divisionID && (
                <div className="flex justify-between">
                  <dt className="text-slate-500">Division</dt>
                  <dd className="font-medium text-slate-900">{divisionID}</dd>
                </div>
              )}
              <div className="flex flex-wrap gap-2">
                {results.divisionWin && <span className="rounded bg-indigo-100 px-2 py-0.5 text-xs font-medium text-indigo-800">Division</span>}
                {results.wildCardWin && <span className="rounded bg-slate-200 px-2 py-0.5 text-xs font-medium text-slate-700">Wild card</span>}
                {results.leagueWin && <span className="rounded bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800">League</span>}
                {results.worldSeriesWin && <span className="rounded bg-amber-200 px-2 py-0.5 text-xs font-medium text-amber-900">World Series</span>}
              </div>
            </dl>
          </section>
        )}

        {/* Batting */}
        {battingEntries.length > 0 && (
          <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <h4 className="mb-3 text-sm font-semibold text-slate-800">Batting</h4>
            <dl className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-sm">
              {battingEntries.map(([key, value]) => (
                <div key={key} className="flex justify-between">
                  <dt className="text-slate-500">{formatStatKey(key)}</dt>
                  <dd className="font-medium tabular-nums text-slate-900">{value}</dd>
                </div>
              ))}
            </dl>
          </section>
        )}

        {/* Pitching */}
        {pitchingEntries.length > 0 && (
          <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <h4 className="mb-3 text-sm font-semibold text-slate-800">Pitching</h4>
            <dl className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-sm">
              {pitchingEntries.map(([key, value]) => (
                <div key={key} className="flex justify-between">
                  <dt className="text-slate-500">{formatStatKey(key)}</dt>
                  <dd className="font-medium tabular-nums text-slate-900">
                    {typeof value === 'number' ? value : String(value)}
                  </dd>
                </div>
              ))}
            </dl>
          </section>
        )}

        {/* Venue & attendance */}
        {(park || attendance != null) && (
          <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <h4 className="mb-3 text-sm font-semibold text-slate-800">Venue</h4>
            <dl className="space-y-1.5 text-sm">
              {park && (
                <div>
                  <dt className="text-slate-500">Park</dt>
                  <dd className="font-medium text-slate-900">{park}</dd>
                </div>
              )}
              {attendance != null && (
                <div className="flex justify-between">
                  <dt className="text-slate-500">Attendance</dt>
                  <dd className="font-medium tabular-nums text-slate-900">{attendance.toLocaleString()}</dd>
                </div>
              )}
            </dl>
          </section>
        )}
      </div>
    </div>
  );
}

export default function TeamsList() {
  const [data, setData] = useState<{ data: TeamResponseDto[]; meta: { total: number; page: number; totalPages: number } } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [teamId, setTeamId] = useState('');
  const [league, setLeague] = useState('');
  const [year, setYear] = useState('');
  const [searchLeague, setSearchLeague] = useState('');
  const [searchYear, setSearchYear] = useState('');
  const [expandedKey, setExpandedKey] = useState<string | null>(null);
  const [exactTeam, setExactTeam] = useState<TeamResponseDto | null>(null);
  const [exactLoading, setExactLoading] = useState(false);
  const [exactError, setExactError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    teamsList({
      page,
      limit: 10,
      league: searchLeague || undefined,
      year: searchYear ? parseInt(searchYear, 10) : undefined,
    })
      .then(setData)
      .catch((e) => setError(e instanceof Error ? e.message : 'Failed to load teams'))
      .finally(() => setLoading(false));
  }, [page, searchLeague, searchYear]);

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchLeague(league.trim() || '');
    setSearchYear(year.trim() || '');
    setPage(1);
    setExpandedKey(null);

    const id = teamId.trim();
    const yearVal = year.trim();
    if (id && yearVal) {
      const parsedYear = parseInt(yearVal, 10);
      if (Number.isNaN(parsedYear)) {
        setExactError('Enter a valid year.');
        setExactTeam(null);
        return;
      }
      setExactLoading(true);
      setExactError(null);
      teamByIdYear(id.toUpperCase(), parsedYear)
        .then((team) => {
          setExactTeam(team);
        })
        .catch((err) => {
          setExactTeam(null);
          setExactError(err instanceof Error ? err.message : 'Team not found');
        })
        .finally(() => setExactLoading(false));
    } else {
      setExactTeam(null);
      setExactError(null);
    }
  };

  const expandedTeam = data?.data.find((t) => teamKey(t) === expandedKey) ?? null;

  return (
    <div className="space-y-4">
      <form onSubmit={submitSearch} className="flex flex-wrap items-end gap-3 rounded-lg border border-slate-200 bg-white p-3">
        <div className="flex flex-col gap-1">
          <label htmlFor="team-id" className="text-xs font-medium text-slate-600">Team ID</label>
          <input
            id="team-id"
            type="text"
            value={teamId}
            onChange={(e) => setTeamId(e.target.value)}
            placeholder="e.g. TOR"
            className="w-24 rounded border border-slate-300 px-3 py-1.5 text-sm uppercase"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor="team-league" className="text-xs font-medium text-slate-600">League</label>
          <input
            id="team-league"
            type="text"
            value={league}
            onChange={(e) => setLeague(e.target.value)}
            placeholder="e.g. AL, NL"
            className="rounded border border-slate-300 px-3 py-1.5 text-sm w-24"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor="team-year" className="text-xs font-medium text-slate-600">Year</label>
          <input
            id="team-year"
            type="number"
            value={year}
            onChange={(e) => setYear(e.target.value)}
            placeholder="e.g. 2023"
            min={1871}
            className="rounded border border-slate-300 px-3 py-1.5 text-sm w-24"
          />
        </div>
        <button type="submit" className="rounded bg-slate-700 px-3 py-1.5 text-sm font-medium text-white hover:bg-slate-800">
          Search
        </button>
      </form>

      {(exactLoading || exactError || exactTeam) && (
        <div className="rounded-lg border border-indigo-100 bg-indigo-50/40 p-4">
          <h3 className="mb-2 text-sm font-semibold text-indigo-900">Exact team lookup</h3>
          {exactLoading && <p className="text-sm text-slate-600">Loading team details…</p>}
          {exactError && !exactLoading && (
            <p className="text-sm text-red-600">{exactError}</p>
          )}
          {exactTeam && !exactLoading && (
            <div className="mt-2 rounded-lg border border-slate-200 bg-white">
              <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-3">
                <div>
                  <span className="font-medium text-slate-900">{exactTeam.name}</span>
                  <span className="ml-2 text-slate-500 text-sm">
                    {exactTeam.teamID} · {exactTeam.yearID} · {exactTeam.league}
                  </span>
                </div>
                <div className="text-sm text-slate-600">
                  {typeof (exactTeam as any).results === 'object' &&
                  (exactTeam as any).results &&
                  'games' in (exactTeam as any).results &&
                  'wins' in (exactTeam as any).results &&
                  'losses' in (exactTeam as any).results ? (
                    <>
                      G: {(exactTeam as any).results.games} · W–L: {(exactTeam as any).results.wins}–
                      {(exactTeam as any).results.losses}
                    </>
                  ) : (
                    'Season results'
                  )}
                  {(exactTeam as any).results?.worldSeriesWin && (
                    <span className="ml-2 font-medium text-amber-600">WS</span>
                  )}
                </div>
              </div>
              <TeamDrawer team={exactTeam} onClose={() => setExactTeam(null)} />
            </div>
          )}
        </div>
      )}

      {error && <p className="text-sm text-red-600">{error}</p>}
      {loading && <p className="text-sm text-slate-500">Loading…</p>}
      {data && !loading && (
        <>
          <p className="text-sm text-slate-600">Total: {data.meta.total}</p>
          <ul className="divide-y divide-slate-200 rounded-lg border border-slate-200 bg-white overflow-hidden">
            {data.data.map((t) => {
              const key = teamKey(t);
              const isExpanded = expandedKey === key;
              return (
                <li key={key}>
                  <button
                    type="button"
                    onClick={() => setExpandedKey(isExpanded ? null : key)}
                    className="flex w-full flex-wrap items-center justify-between gap-2 px-4 py-3 text-left hover:bg-slate-50 focus:bg-slate-50 focus:outline-none"
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-slate-900">{t.name}</span>
                      <span className="text-slate-500 text-sm">
                        {t.teamID} · {t.yearID} · {t.league}
                      </span>
                      <span className="text-slate-400 text-sm" aria-hidden>
                        {isExpanded ? '▼' : '▶'}
                      </span>
                    </div>
                    <div className="text-sm text-slate-600">
                      W–L: {t.batting?.wins ?? '—'}–{t.batting?.losses ?? '—'}
                      {t.results?.worldSeriesWin && <span className="ml-2 font-medium text-amber-600">WS</span>}
                    </div>
                  </button>
                  {isExpanded && expandedTeam && <TeamDrawer team={expandedTeam} onClose={() => setExpandedKey(null)} />}
                </li>
              );
            })}
          </ul>
          {data.meta.totalPages > 1 && (
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
                className="rounded border border-slate-300 px-3 py-1 text-sm disabled:opacity-50 hover:bg-slate-50"
              >
                Previous
              </button>
              <span className="text-sm text-slate-600">
                Page {data.meta.page} of {data.meta.totalPages}
              </span>
              <button
                type="button"
                disabled={page >= data.meta.totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="rounded border border-slate-300 px-3 py-1 text-sm disabled:opacity-50 hover:bg-slate-50"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
