import { useCallback, useEffect, useState } from 'react';
import {
  collectionsList,
  collectionDelete,
  collectionById,
  playerById,
} from 'api/client';
import type { CollectionResponseDto, PlayerResponseDto } from 'api/types';
import { useAuth } from 'contexts/AuthContext';
import CollectionForm from './CollectionForm';

export default function CollectionsList() {
  const { isAuthenticated } = useAuth();
  const [data, setData] = useState<{
    data: CollectionResponseDto[];
    meta: { total: number; page: number; totalPages: number };
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [nameFilter, setNameFilter] = useState('');
  const [searchName, setSearchName] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [detailId, setDetailId] = useState<string | null>(null);
  const [detail, setDetail] = useState<CollectionResponseDto | null>(null);
  const [detailPlayers, setDetailPlayers] = useState<PlayerResponseDto[]>([]);
  const [detailLoadingPlayers, setDetailLoadingPlayers] = useState(false);

  const fetchList = useCallback(() => {
    if (!isAuthenticated) return;
    setLoading(true);
    setError(null);
    collectionsList({ page, limit: 10, name: searchName || undefined })
      .then(setData)
      .catch((e) => setError(e instanceof Error ? e.message : 'Failed to load collections'))
      .finally(() => setLoading(false));
  }, [isAuthenticated, page, searchName]);

  useEffect(() => {
    if (!isAuthenticated) {
      setData(null);
      return;
    }
    fetchList();
  }, [isAuthenticated, fetchList]);

  useEffect(() => {
    if (!detailId || !isAuthenticated) {
      setDetail(null);
      setDetailPlayers([]);
      return;
    }
    collectionById(detailId)
      .then((c) => {
        setDetail(c);
        if (c.playerIDs.length === 0) {
          setDetailPlayers([]);
          return;
        }
        setDetailLoadingPlayers(true);
        Promise.all(
          Array.from(new Set(c.playerIDs)).map(async (id) => {
            try {
              return await playerById(id);
            } catch {
              return null;
            }
          })
        )
          .then((players) => {
            setDetailPlayers(players.filter((p): p is PlayerResponseDto => p !== null));
          })
          .finally(() => setDetailLoadingPlayers(false));
      })
      .catch(() => {
        setDetail(null);
        setDetailPlayers([]);
      });
  }, [detailId, isAuthenticated]);

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this collection?')) return;
    try {
      await collectionDelete(id);
      if (editingId === id) setEditingId(null);
      if (detailId === id) setDetailId(null);
      fetchList();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Delete failed');
    }
  };

  const handleSaved = () => {
    setCreating(false);
    setEditingId(null);
    setDetailId(null);
    fetchList();
  };

  if (!isAuthenticated) {
    return (
      <p className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
        Log in to view and manage your collections.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setSearchName(nameFilter.trim());
            setPage(1);
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={nameFilter}
            onChange={(e) => setNameFilter(e.target.value)}
            placeholder="Filter by name"
            className="rounded border border-slate-300 px-3 py-1.5 text-sm w-48"
          />
          <button type="submit" className="rounded bg-slate-700 px-3 py-1.5 text-sm font-medium text-white hover:bg-slate-800">
            Search
          </button>
        </form>
        <button
          type="button"
          onClick={() => { setCreating(true); setEditingId(null); setDetailId(null); }}
          className="rounded bg-indigo-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-indigo-700"
        >
          New collection
        </button>
      </div>

      {creating && (
        <CollectionForm onSaved={handleSaved} onCancel={() => setCreating(false)} />
      )}

      {error && <p className="text-sm text-red-600">{error}</p>}
      {loading && <p className="text-sm text-slate-500">Loading…</p>}
      {data && !loading && (
        <>
          <p className="text-sm text-slate-600">Total: {data.meta.total}</p>
          <ul className="divide-y divide-slate-200 rounded-lg border border-slate-200 bg-white">
            {data.data.map((c) => (
              <li key={c.id} className="px-4 py-3">
                {editingId === c.id ? (
                  <CollectionForm
                    initial={c}
                    onSaved={handleSaved}
                    onCancel={() => setEditingId(null)}
                  />
                ) : (
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <span className="font-medium text-slate-900">{c.name}</span>
                      {c.description && (
                        <span className="ml-2 text-slate-500 text-sm">— {c.description}</span>
                      )}
                      <span className="ml-2 text-slate-400 text-sm">{c.playerIDs.length} players</span>
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => { setDetailId(detailId === c.id ? null : c.id); setEditingId(null); }}
                        className="text-sm text-indigo-600 hover:underline"
                      >
                        View
                      </button>
                      <button
                        type="button"
                        onClick={() => { setEditingId(c.id); setDetailId(null); }}
                        className="text-sm text-slate-600 hover:underline"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(c.id)}
                        className="text-sm text-red-600 hover:underline"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                )}
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

      {detail && (
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
          <div className="flex items-center justify-between">
            <h3 className="font-medium text-slate-900">{detail.name}</h3>
            <button
              type="button"
              onClick={() => setDetailId(null)}
              className="text-slate-500 hover:text-slate-700"
            >
              Close
            </button>
          </div>
          {detail.description && <p className="mt-1 text-sm text-slate-600">{detail.description}</p>}

          <div className="mt-3 rounded border border-slate-200 bg-white p-3">
            <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
              Players in collection
            </h4>
            {detailLoadingPlayers && (
              <p className="text-xs text-slate-500">Loading player details…</p>
            )}
            {!detailLoadingPlayers && detail.playerIDs.length === 0 && (
              <p className="text-xs text-slate-500">No players.</p>
            )}
            {!detailLoadingPlayers && detail.playerIDs.length > 0 && (
              <ul className="max-h-56 divide-y divide-slate-200 overflow-auto text-sm">
                {detail.playerIDs.map((id) => {
                  const player = detailPlayers.find((p) => p.playerID === id);
                  return (
                    <li key={id} className="flex items-center justify-between gap-2 py-1.5">
                      <div>
                        <span className="font-medium text-slate-900">
                          {player ? `${player.nameFirst} ${player.nameLast}` : id}
                        </span>
                        <span className="ml-2 text-xs text-slate-500">({id})</span>
                        {player && (
                          <span className="ml-2 text-xs text-slate-400">
                            {player.birthCountry} · H {player.height}&quot; · W {player.weight} lb
                          </span>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
