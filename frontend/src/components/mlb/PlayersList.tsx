import { useEffect, useState } from 'react';
import { playersList } from 'api/client';
import type { PlayerResponseDto } from 'api/types';
import { useAuth } from 'contexts/AuthContext';
import { classNames } from 'utils';

export default function PlayersList() {
  const { isAuthenticated } = useAuth();
  const [data, setData] = useState<{ data: PlayerResponseDto[]; meta: { total: number; page: number; totalPages: number } } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [name, setName] = useState('');
  const [birthCountry, setBirthCountry] = useState('');
  const [searchName, setSearchName] = useState('');
  const [searchCountry, setSearchCountry] = useState('');

  useEffect(() => {
    if (!isAuthenticated) {
      setData(null);
      return;
    }
    setLoading(true);
    setError(null);
    playersList({ page, limit: 10, name: searchName || undefined, birthCountry: searchCountry || undefined })
      .then(setData)
      .catch((e) => setError(e instanceof Error ? e.message : 'Failed to load players'))
      .finally(() => setLoading(false));
  }, [isAuthenticated, page, searchName, searchCountry]);

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchName(name.trim() || '');
    setSearchCountry(birthCountry.trim() || '');
    setPage(1);
  };

  if (!isAuthenticated) {
    return (
      <p className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
        Log in to view and search players.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      <form onSubmit={submitSearch} className="flex flex-wrap items-end gap-3 rounded-lg border border-slate-200 bg-white p-3">
        <div className="flex flex-col gap-1">
          <label htmlFor="player-name" className="text-xs font-medium text-slate-600">Name</label>
          <input
            id="player-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Filter by name"
            className="rounded border border-slate-300 px-3 py-1.5 text-sm w-40"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor="player-country" className="text-xs font-medium text-slate-600">Birth country</label>
          <input
            id="player-country"
            type="text"
            value={birthCountry}
            onChange={(e) => setBirthCountry(e.target.value)}
            placeholder="e.g. USA"
            className="rounded border border-slate-300 px-3 py-1.5 text-sm w-32"
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
            {data.data.map((p) => (
              <li key={p.playerID} className="flex flex-wrap items-center justify-between gap-2 px-4 py-3">
                <div>
                  <span className={classNames('font-medium text-slate-900')}>
                    {p.nameFirst} {p.nameLast}
                  </span>
                  <span className="ml-2 text-slate-500 text-sm">({p.playerID})</span>
                </div>
                <div className="flex gap-4 text-sm text-slate-600">
                  <span>Country: {p.birthCountry}</span>
                  <span>H: {p.height}" W: {p.weight} lb</span>
                  {p.career_batting && (
                    <span>AVG .{p.career_batting.battingAverage?.toFixed(3)?.replace('0.', '') ?? '---'}</span>
                  )}
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
