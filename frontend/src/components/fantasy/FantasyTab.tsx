import { useCallback, useEffect, useState } from 'react';
import { collectionsList, matchesList } from 'api/client';
import type { CollectionResponseDto, MatchResponseDto } from 'api/types';
import { useAuth } from 'contexts/AuthContext';
import CollectionsList from './CollectionsList';
import MatchLog from './MatchLog';
import MatchPlay from './MatchPlay';
import TeamWinsLeaderboard from './TeamWinsLeaderboard';

export default function FantasyTab() {
  const { isAuthenticated } = useAuth();

  const [collections, setCollections] = useState<CollectionResponseDto[]>([]);
  const [collectionsLoading, setCollectionsLoading] = useState(false);
  const [collectionsError, setCollectionsError] = useState<string | null>(null);

  const [recentMatches, setRecentMatches] = useState<MatchResponseDto[]>([]);
  const [lastMatch, setLastMatch] = useState<MatchResponseDto | null>(null);
  const [matchesLoading, setMatchesLoading] = useState(false);

  const fetchMatches = useCallback(() => {
    if (!isAuthenticated) return;
    setMatchesLoading(true);
    matchesList({ page: 1, limit: 10 })
      .then((res) => setRecentMatches(res.data))
      .catch(() => setRecentMatches([]))
      .finally(() => setMatchesLoading(false));
  }, [isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated) {
      setCollections([]);
      setRecentMatches([]);
      setLastMatch(null);
      return;
    }

    setCollectionsLoading(true);
    setCollectionsError(null);
    collectionsList({ page: 1, limit: 50 })
      .then((res) => setCollections(res.data))
      .catch((e) => setCollectionsError(e instanceof Error ? e.message : 'Failed to load collections'))
      .finally(() => setCollectionsLoading(false));

    fetchMatches();
  }, [isAuthenticated, fetchMatches]);

  const onMatchPlayed = useCallback((match: MatchResponseDto) => {
    setLastMatch(match);
    setRecentMatches((prev) => {
      const existing = prev.filter((m) => m.id !== match.id);
      return [match, ...existing].slice(0, 10);
    });
  }, []);

  return (
    <div className="space-y-6">
      <p className="text-sm text-slate-600">
        Create and manage your fantasy collections, then play them against each other using the match service.
      </p>

      <TeamWinsLeaderboard />

      <MatchPlay
        collections={collections}
        collectionsLoading={collectionsLoading}
        collectionsError={collectionsError}
        lastMatch={lastMatch}
        onMatchPlayed={onMatchPlayed}
      />

      <CollectionsList />

      {isAuthenticated && (
        <MatchLog
          matches={recentMatches}
          collections={collections}
          loading={matchesLoading}
        />
      )}
    </div>
  );
}
