import { useEffect, useState } from 'react';
import { playerById, playersList } from 'api/client';
import type { PlayerResponseDto } from 'api/types';
import { classNames } from 'utils';

function PlayerDrawer({ playerId, onClose }: { playerId: string; onClose: () => void }) {
  const [player, setPlayer] = useState<PlayerResponseDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    playerById(playerId)
      .then(setPlayer)
      .catch((e) => setError(e instanceof Error ? e.message : 'Failed to load player details'))
      .finally(() => setLoading(false));
  }, [playerId]);

  const career_batting = player?.career_batting;
  const careerHighs = player?.careerHighs;
  const career_pitching = player?.career_pitching;

  return (
    <div className="border-t border-slate-200 bg-slate-50/80">
      <div className="flex items-center justify-between px-4 py-2">
        <span className="text-xs font-medium uppercase tracking-wide text-slate-500">Player details</span>
        <button
          type="button"
          onClick={onClose}
          className="text-slate-500 hover:text-slate-700 text-sm"
          aria-label="Close"
        >
          Close
        </button>
      </div>
      <div className="grid gap-6 px-4 pb-4 pt-0 sm:grid-cols-2 lg:grid-cols-3">
        {loading && (
          <p className="col-span-full text-sm text-slate-500">Loading player details…</p>
        )}
        {error && !loading && (
          <p className="col-span-full text-sm text-red-600">{error}</p>
        )}
        {!loading && !error && player && (
          <>
        <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <h4 className="mb-3 text-sm font-semibold text-slate-800">Profile</h4>
          <dl className="space-y-1.5 text-sm">
            <div className="flex justify-between">
              <dt className="text-slate-500">Name</dt>
              <dd className="font-medium text-slate-900">
                {player.nameFirst} {player.nameLast}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-slate-500">ID</dt>
              <dd className="font-mono text-xs text-slate-900">{player.playerID}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-slate-500">Country</dt>
              <dd className="font-medium text-slate-900">{player.birthCountry}</dd>
            </div>
              <div className="flex justify-between">
                <dt className="text-slate-500">Height</dt>
                <dd className="font-medium text-slate-900">{player.height}&quot;</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-500">Weight</dt>
                <dd className="font-medium text-slate-900">{player.weight} lb</dd>
              </div>
          </dl>
        </section>

        {career_batting && (
          <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <h4 className="mb-3 text-sm font-semibold text-slate-800">Career batting</h4>
            <dl className="space-y-1.5 text-sm">
              <div className="flex justify-between">
                <dt className="text-slate-500">BA</dt>
                <dd className="font-medium tabular-nums text-slate-900">
                  {career_batting.battingAverage.toFixed(3)}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-500">OBP</dt>
                <dd className="font-medium tabular-nums text-slate-900">
                  {career_batting.onBasePercentage.toFixed(3)}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-500">SLG</dt>
                <dd className="font-medium tabular-nums text-slate-900">
                  {career_batting.sluggingPercentage.toFixed(3)}
                </dd>
              </div>
            </dl>
            {careerHighs && (
              <div className="mt-3 border-t border-dashed border-slate-200 pt-2">
                <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-500">Single‑season highs</p>
                <dl className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <dt className="text-slate-500">HR</dt>
                    <dd className="font-medium tabular-nums text-slate-900">{careerHighs.HR}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-slate-500">Hits</dt>
                    <dd className="font-medium tabular-nums text-slate-900">{careerHighs.H}</dd>
                  </div>
                </dl>
              </div>
            )}
          </section>
        )}

        {career_pitching && (
          <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <h4 className="mb-3 text-sm font-semibold text-slate-800">Career pitching</h4>
            <dl className="space-y-1.5 text-sm">
              <div className="flex justify-between">
                <dt className="text-slate-500">Record</dt>
                <dd className="font-medium tabular-nums text-slate-900">
                  {career_pitching.wins}–{career_pitching.losses}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-500">ERA</dt>
                <dd className="font-medium tabular-nums text-slate-900">
                  {career_pitching.averageEra.toFixed(2)}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-500">Strikeouts</dt>
                <dd className="font-medium tabular-nums text-slate-900">{career_pitching.strikeouts}</dd>
              </div>
            </dl>
          </section>
        )}
        </>
        )}
      </div>
    </div>
  );
}

export default function PlayersList() {
  const [data, setData] = useState<{ data: PlayerResponseDto[]; meta: { total: number; page: number; totalPages: number } } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [name, setName] = useState('');
  const [birthCountry, setBirthCountry] = useState('');
  const [searchName, setSearchName] = useState('');
  const [searchCountry, setSearchCountry] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    playersList({ page, limit: 10, name: searchName || undefined, birthCountry: searchCountry || undefined })
      .then(setData)
      .catch((e) => setError(e instanceof Error ? e.message : 'Failed to load players'))
      .finally(() => setLoading(false));
  }, [page, searchName, searchCountry]);

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchName(name.trim() || '');
    setSearchCountry(birthCountry.trim() || '');
    setPage(1);
    setExpandedId(null);
  };

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
          <ul className="divide-y divide-slate-200 rounded-lg border border-slate-200 bg-white overflow-hidden">
            {data.data.map((p) => {
              const isExpanded = expandedId === p.playerID;
              const ba =
                p.career_batting?.battingAverage != null
                  ? p.career_batting.battingAverage.toFixed(3).replace('0.', '')
                  : null;
              return (
                <li key={p.playerID}>
                  <button
                    type="button"
                    onClick={() => setExpandedId(isExpanded ? null : p.playerID)}
                    className="flex w-full flex-wrap items-center justify-between gap-2 px-4 py-3 text-left hover:bg-slate-50 focus:bg-slate-50 focus:outline-none"
                  >
                    <div className="flex items-center gap-2">
                      <span className={classNames('font-medium text-slate-900')}>
                        {p.nameFirst} {p.nameLast}
                      </span>
                      <span className="text-slate-500 text-sm">({p.playerID})</span>
                      <span className="text-slate-400 text-sm" aria-hidden>
                        {isExpanded ? '▼' : '▶'}
                      </span>
                    </div>
                    <div className="flex gap-4 text-sm text-slate-600">
                      <span>Country: {p.birthCountry}</span>
                      <span>
                        H: {p.height}"
                        {'  '}W: {p.weight} lb
                      </span>
                      {ba && <span>BA .{ba}</span>}
                    </div>
                  </button>
                  {isExpanded && <PlayerDrawer playerId={p.playerID} onClose={() => setExpandedId(null)} />}
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
