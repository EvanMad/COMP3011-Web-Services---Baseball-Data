import { useEffect, useState } from 'react';
import { collectionCreate, collectionUpdate, playerById, playersList } from 'api/client';
import type { CollectionResponseDto, CreateCollectionDto, PlayerResponseDto } from 'api/types';

interface CollectionFormProps {
  initial?: CollectionResponseDto;
  onSaved: () => void;
  onCancel: () => void;
}

export default function CollectionForm({ initial, onSaved, onCancel }: CollectionFormProps) {
  const [name, setName] = useState(initial?.name ?? '');
  const [description, setDescription] = useState(initial?.description ?? '');
  const [playerIds, setPlayerIds] = useState<string[]>(initial?.playerIDs ?? []);
  const [selectedPlayers, setSelectedPlayers] = useState<PlayerResponseDto[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<PlayerResponseDto[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initial) {
      setName(initial.name);
      setDescription(initial.description ?? '');
      setPlayerIds(initial.playerIDs);
    }
  }, [initial]);

  // Load human-readable player info for existing IDs
  useEffect(() => {
    if (playerIds.length === 0) {
      setSelectedPlayers([]);
      return;
    }
    let cancelled = false;
    const load = async () => {
      try {
        const uniqueIds = Array.from(new Set(playerIds));
        const players = await Promise.all(
          uniqueIds.map(async (id) => {
            try {
              return await playerById(id);
            } catch {
              return null;
            }
          })
        );
        if (cancelled) return;
        setSelectedPlayers(players.filter((p): p is PlayerResponseDto => p !== null));
      } catch {
        if (!cancelled) {
          setSelectedPlayers([]);
        }
      }
    };
    void load();
    return () => {
      cancelled = true;
    };
  }, [playerIds.join(',')]);

  const handleSearch = async () => {
    const term = searchTerm.trim();
    if (term.length < 2) {
      setSearchError('Type at least 2 characters to search.');
      setSearchResults([]);
      return;
    }
    setSearchLoading(true);
    setSearchError(null);
    try {
      const res = await playersList({ page: 1, limit: 10, name: term });
      setSearchResults(res.data);
      if (res.data.length === 0) {
        setSearchError('No players found for that name.');
      }
    } catch (e) {
      setSearchResults([]);
      setSearchError(e instanceof Error ? e.message : 'Search failed');
    } finally {
      setSearchLoading(false);
    }
  };

  const addPlayer = (player: PlayerResponseDto) => {
    if (playerIds.includes(player.playerID)) return;
    setPlayerIds((prev) => [...prev, player.playerID]);
    setSelectedPlayers((prev) => [...prev, player]);
  };

  const removePlayer = (playerId: string) => {
    setPlayerIds((prev) => prev.filter((id) => id !== playerId));
    setSelectedPlayers((prev) => prev.filter((p) => p.playerID !== playerId));
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const playerIDs = playerIds;
    if (playerIDs.length === 0) {
      setError('Add at least one player to the collection.');
      return;
    }
    if (playerIDs.length > 50) {
      setError('Maximum 50 players per collection.');
      return;
    }
    setError(null);
    setLoading(true);
    try {
      if (initial) {
        await collectionUpdate(initial.id, { name, description: description || undefined, playerIDs });
      } else {
        const dto: CreateCollectionDto = { name, playerIDs };
        if (description.trim()) dto.description = description.trim();
        await collectionCreate(dto);
      }
      onSaved();
    } catch (e: unknown) {
      const msg = e && typeof e === 'object' && 'body' in e && e.body && typeof (e.body as { message?: string }).message === 'string'
        ? (e.body as { message: string }).message
        : e instanceof Error ? e.message : 'Save failed';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={submit} className="rounded-lg border border-slate-200 bg-white p-4 space-y-3">
      <div>
        <label htmlFor="col-name" className="block text-xs font-medium text-slate-600">Name *</label>
        <input
          id="col-name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          maxLength={100}
          className="mt-0.5 w-full rounded border border-slate-300 px-3 py-1.5 text-sm"
        />
      </div>
      <div>
        <label htmlFor="col-desc" className="block text-xs font-medium text-slate-600">Description</label>
        <input
          id="col-desc"
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          maxLength={500}
          placeholder="Optional"
          className="mt-0.5 w-full rounded border border-slate-300 px-3 py-1.5 text-sm"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-slate-600">Players *</label>
        <p className="mt-0.5 text-xs text-slate-500">
          Search by name, then add players to this collection. Up to 50 players.
        </p>

        {/* Selected players */}
        <div className="mt-2 rounded border border-slate-200 bg-slate-50">
          {playerIds.length === 0 ? (
            <p className="px-3 py-2 text-xs text-slate-500">No players yet. Use search below to add some.</p>
          ) : (
            <ul className="max-h-48 divide-y divide-slate-200 overflow-auto text-sm">
              {playerIds.map((id) => {
                const player = selectedPlayers.find((p) => p.playerID === id);
                return (
                  <li key={id} className="flex items-center justify-between gap-2 px-3 py-2">
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
                    <button
                      type="button"
                      onClick={() => removePlayer(id)}
                      className="text-xs font-medium text-red-600 hover:text-red-700"
                    >
                      Remove
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* Search area */}
        <div className="mt-3 flex flex-wrap items-end gap-2 rounded border border-slate-200 bg-white p-2">
          <div className="flex flex-col gap-1">
            <label htmlFor="player-search" className="text-xs font-medium text-slate-600">
              Search players by name
            </label>
            <input
              id="player-search"
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="e.g. Ruth"
              className="w-48 rounded border border-slate-300 px-3 py-1.5 text-sm"
            />
          </div>
          <button
            type="button"
            disabled={searchLoading}
            className="rounded bg-slate-700 px-3 py-1.5 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-50"
          >
            {searchLoading ? 'Searching…' : 'Search'}
          </button>
          {searchError && <p className="w-full text-xs text-red-600">{searchError}</p>}
        </div>

        {searchResults.length > 0 && (
          <div className="mt-2 max-h-56 overflow-auto rounded border border-slate-200 bg-white">
            <ul className="divide-y divide-slate-200 text-sm">
              {searchResults.map((p) => (
                <li key={p.playerID} className="flex items-center justify-between gap-2 px-3 py-2">
                  <div>
                    <span className="font-medium text-slate-900">
                      {p.nameFirst} {p.nameLast}
                    </span>
                    <span className="ml-2 text-xs text-slate-500">({p.playerID})</span>
                    <span className="ml-2 text-xs text-slate-400">
                      {p.birthCountry} · H {p.height}&quot; · W {p.weight} lb
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => addPlayer(p)}
                    disabled={playerIds.includes(p.playerID)}
                    className="rounded bg-indigo-600 px-3 py-1 text-xs font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
                  >
                    {playerIds.includes(p.playerID) ? 'Added' : 'Add'}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={loading}
          className="rounded bg-indigo-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
        >
          {loading ? 'Saving…' : initial ? 'Update' : 'Create'}
        </button>
        <button type="button" onClick={onCancel} className="rounded border border-slate-300 px-4 py-1.5 text-sm hover:bg-slate-50">
          Cancel
        </button>
      </div>
    </form>
  );
}
