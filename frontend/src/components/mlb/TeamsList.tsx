import { useEffect, useState } from 'react';
import { teamsList } from 'api/client';
import type { TeamResponseDto } from 'api/types';

export default function TeamsList() {
  const [data, setData] = useState<{ data: TeamResponseDto[]; meta: { total: number; page: number; totalPages: number } } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [league, setLeague] = useState('');
  const [year, setYear] = useState('');
  const [searchLeague, setSearchLeague] = useState('');
  const [searchYear, setSearchYear] = useState('');

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
  };

  return (
    <div className="space-y-4">
      <form onSubmit={submitSearch} className="flex flex-wrap items-end gap-3 rounded-lg border border-slate-200 bg-white p-3">
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

      {error && <p className="text-sm text-red-600">{error}</p>}
      {loading && <p className="text-sm text-slate-500">Loading…</p>}
      {data && !loading && (
        <>
          <p className="text-sm text-slate-600">Total: {data.meta.total}</p>
          <ul className="divide-y divide-slate-200 rounded-lg border border-slate-200 bg-white">
            {data.data.map((t) => (
              <li key={`${t.teamID}-${t.yearID}`} className="flex flex-wrap items-center justify-between gap-2 px-4 py-3">
                <div>
                  <span className="font-medium text-slate-900">{t.name}</span>
                  <span className="ml-2 text-slate-500 text-sm">
                    {t.teamID} · {t.yearID} · {t.league}
                  </span>
                </div>
                <div className="text-sm text-slate-600">
                  W–L: {t.batting?.wins ?? '—'}–{t.batting?.losses ?? '—'}
                  {t.results?.worldSeriesWin && <span className="ml-2 font-medium text-amber-600">WS</span>}
                </div>
              </li>
            ))}
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
