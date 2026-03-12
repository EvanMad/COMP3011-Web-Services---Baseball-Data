import type { CollectionResponseDto, MatchResponseDto } from 'api/types';

interface CollectionWinsLeaderboardProps {
  collections: CollectionResponseDto[];
  matches: MatchResponseDto[];
}

function countWins(collectionId: string, matches: MatchResponseDto[]): number {
  return matches.filter((m) => m.winnerCollectionId === collectionId).length;
}

function countMatchesPlayed(collectionId: string, matches: MatchResponseDto[]): number {
  return matches.filter(
    (m) => m.collectionAId === collectionId || m.collectionBId === collectionId
  ).length;
}

export default function CollectionWinsLeaderboard({ collections, matches }: CollectionWinsLeaderboardProps) {
  const ranked = collections
    .map((c) => ({
      collection: c,
      wins: countWins(c.id, matches),
      played: countMatchesPlayed(c.id, matches),
    }))
    .filter((row) => row.played > 0)
    .sort((a, b) => b.wins - a.wins);

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <h3 className="text-sm font-semibold text-slate-900">Collection wins leaderboard</h3>
      <p className="mt-1 text-xs text-slate-600">
        Your collections ranked by match wins. Only collections that have played at least one match appear.
      </p>

      {ranked.length === 0 ? (
        <p className="mt-4 text-sm text-slate-500">No matches played yet. Play some matches to see your top collections.</p>
      ) : (
        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-slate-600">
                <th className="pb-2 pr-4 font-medium">#</th>
                <th className="pb-2 pr-4 font-medium">Collection</th>
                <th className="pb-2 pr-4 font-medium text-right">Wins</th>
                <th className="pb-2 font-medium text-right">Matches</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {ranked.map((row, index) => (
                <tr key={row.collection.id} className="hover:bg-slate-50">
                  <td className="py-2 pr-4 text-slate-500">{index + 1}</td>
                  <td className="py-2 pr-4 font-medium text-slate-900">{row.collection.name}</td>
                  <td className="py-2 pr-4 text-right tabular-nums font-medium text-slate-900">
                    {row.wins}
                  </td>
                  <td className="py-2 text-right tabular-nums text-slate-600">{row.played}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
