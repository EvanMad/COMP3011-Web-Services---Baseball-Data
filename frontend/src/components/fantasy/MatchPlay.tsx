import { useEffect, useState } from 'react';
import { collectionsList, matchCreate, matchesList } from 'api/client';
import type { CollectionResponseDto, MatchResponseDto } from 'api/types';
import { useAuth } from 'contexts/AuthContext';

function formatMatchResult(match: MatchResponseDto, collections: CollectionResponseDto[]) {
  const a = collections.find((c) => c.id === match.collectionAId);
  const b = collections.find((c) => c.id === match.collectionBId);
  const winner =
    match.winnerCollectionId === null
      ? 'Draw'
      : match.winnerCollectionId === match.collectionAId
        ? a?.name ?? 'Collection A'
        : b?.name ?? 'Collection B';

  return {
    aName: a?.name ?? match.collectionAId,
    bName: b?.name ?? match.collectionBId,
    winner,
  };
}

export default function MatchPlay() {
  const { isAuthenticated } = useAuth();
  const [collections, setCollections] = useState<CollectionResponseDto[]>([]);
  const [collectionsLoading, setCollectionsLoading] = useState(false);
  const [collectionsError, setCollectionsError] = useState<string | null>(null);

  const [selectedA, setSelectedA] = useState<string>('');
  const [selectedB, setSelectedB] = useState<string>('');

  const [playing, setPlaying] = useState(false);
  const [playError, setPlayError] = useState<string | null>(null);
  const [lastMatch, setLastMatch] = useState<MatchResponseDto | null>(null);

  const [recentMatches, setRecentMatches] = useState<MatchResponseDto[]>([]);
  const [matchesLoading, setMatchesLoading] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      setCollections([]);
      setRecentMatches([]);
      return;
    }

    setCollectionsLoading(true);
    setCollectionsError(null);
    collectionsList({ page: 1, limit: 50 })
      .then((res) => {
        setCollections(res.data);
      })
      .catch((e) => setCollectionsError(e instanceof Error ? e.message : 'Failed to load collections'))
      .finally(() => setCollectionsLoading(false));

    setMatchesLoading(true);
    matchesList({ page: 1, limit: 10 })
      .then((res) => setRecentMatches(res.data))
      .catch(() => setRecentMatches([]))
      .finally(() => setMatchesLoading(false));
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return null;
  }

  const collectionA = collections.find((c) => c.id === selectedA) ?? null;
  const collectionB = collections.find((c) => c.id === selectedB) ?? null;

  const canPlay =
    !!collectionA &&
    !!collectionB &&
    collectionA.id !== collectionB.id &&
    collectionA.playerIDs.length === 9 &&
    collectionB.playerIDs.length === 9 &&
    !playing;

  const playMatch = async () => {
    if (!canPlay || !collectionA || !collectionB) return;
    setPlaying(true);
    setPlayError(null);
    try {
      const match = await matchCreate({
        collectionAId: collectionA.id,
        collectionBId: collectionB.id,
      });
      setLastMatch(match);
      setRecentMatches((prev) => {
        const existing = prev.filter((m) => m.id !== match.id);
        return [match, ...existing].slice(0, 10);
      });
    } catch (e) {
      setPlayError(e instanceof Error ? e.message : 'Match failed');
    } finally {
      setPlaying(false);
    }
  };

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm space-y-4">
      <header>
        <h3 className="text-sm font-semibold text-slate-900">Play a match</h3>
        <p className="mt-1 text-xs text-slate-600">
          Pick two collections of exactly 9 players each and simulate a matchup. Results are stored by the API.
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <label htmlFor="match-col-a" className="block text-xs font-medium text-slate-600">
            Collection A
          </label>
          <select
            id="match-col-a"
            value={selectedA}
            onChange={(e) => setSelectedA(e.target.value)}
            className="w-full rounded border border-slate-300 px-3 py-1.5 text-sm"
            disabled={collectionsLoading || collections.length === 0}
          >
            <option value="">Select collection</option>
            {collections.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} ({c.playerIDs.length} players)
              </option>
            ))}
          </select>
          {collectionA && collectionA.playerIDs.length !== 9 && (
            <p className="text-xs text-amber-600">
              Collection A currently has {collectionA.playerIDs.length} players. It must have exactly 9.
            </p>
          )}
        </div>

        <div className="space-y-2">
          <label htmlFor="match-col-b" className="block text-xs font-medium text-slate-600">
            Collection B
          </label>
          <select
            id="match-col-b"
            value={selectedB}
            onChange={(e) => setSelectedB(e.target.value)}
            className="w-full rounded border border-slate-300 px-3 py-1.5 text-sm"
            disabled={collectionsLoading || collections.length === 0}
          >
            <option value="">Select collection</option>
            {collections.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} ({c.playerIDs.length} players)
              </option>
            ))}
          </select>
          {collectionB && collectionB.playerIDs.length !== 9 && (
            <p className="text-xs text-amber-600">
              Collection B currently has {collectionB.playerIDs.length} players. It must have exactly 9.
            </p>
          )}
        </div>
      </div>

      {collectionsError && <p className="text-xs text-red-600">{collectionsError}</p>}

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={playMatch}
          disabled={!canPlay}
          className="rounded bg-emerald-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
        >
          {playing ? 'Playing…' : 'Play match'}
        </button>
        {!collectionA || !collectionB ? (
          <span className="text-xs text-slate-500">Select two different collections.</span>
        ) : collectionA.playerIDs.length !== 9 || collectionB.playerIDs.length !== 9 ? (
          <span className="text-xs text-slate-500">Each collection must have exactly 9 players.</span>
        ) : (
          <span className="text-xs text-slate-500">Ready to play.</span>
        )}
      </div>

      {playError && <p className="text-xs text-red-600">{playError}</p>}

      {lastMatch && (
        <div className="rounded border border-emerald-100 bg-emerald-50 p-3">
          <h4 className="mb-1 text-xs font-semibold uppercase tracking-wide text-emerald-800">
            Latest result
          </h4>
          <MatchSummary match={lastMatch} collections={collections} />
        </div>
      )}

      <div className="rounded border border-slate-200 bg-slate-50 p-3">
        <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
          Recent matches
        </h4>
        {matchesLoading && <p className="text-xs text-slate-500">Loading matches…</p>}
        {!matchesLoading && recentMatches.length === 0 && (
          <p className="text-xs text-slate-500">No matches have been played yet.</p>
        )}
        {!matchesLoading && recentMatches.length > 0 && (
          <ul className="space-y-1 text-xs">
            {recentMatches.map((m) => (
              <li key={m.id} className="flex items-center justify-between gap-2">
                <MatchSummary match={m} collections={collections} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}

function MatchSummary({ match, collections }: { match: MatchResponseDto; collections: CollectionResponseDto[] }) {
  const { aName, bName, winner } = formatMatchResult(match, collections);
  const date = new Date(match.createdAt);
  const formatted = Number.isNaN(date.getTime()) ? match.createdAt : date.toLocaleString();

  return (
    <>
      <div className="flex flex-col text-xs text-slate-700">
        <span>
          {aName} vs {bName}
        </span>
        <span className="text-slate-500">
          Winner:{' '}
          <span className="font-medium text-slate-900">
            {winner}
          </span>
        </span>
      </div>
      <span className="text-[10px] text-slate-400">{formatted}</span>
    </>
  );
}

