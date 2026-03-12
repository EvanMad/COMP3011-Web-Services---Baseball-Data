import type { CollectionResponseDto, MatchResponseDto } from 'api/types';

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

interface MatchLogProps {
  matches: MatchResponseDto[];
  collections: CollectionResponseDto[];
  loading: boolean;
}

export default function MatchLog({ matches, collections, loading }: MatchLogProps) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <h3 className="text-sm font-semibold text-slate-900">Match log</h3>
      <p className="mt-1 text-xs text-slate-600">
        Recent matches you have played. Results are stored by the API.
      </p>

      {loading && (
        <p className="mt-4 text-sm text-slate-500">Loading matches…</p>
      )}
      {!loading && matches.length === 0 && (
        <p className="mt-4 text-sm text-slate-500">No matches have been played yet.</p>
      )}
      {!loading && matches.length > 0 && (
        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-slate-600">
                <th className="pb-2 pr-4 font-medium">Date</th>
                <th className="pb-2 pr-4 font-medium">Collection A</th>
                <th className="pb-2 pr-4 font-medium w-8">vs</th>
                <th className="pb-2 pr-4 font-medium">Collection B</th>
                <th className="pb-2 font-medium">Winner</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {matches.map((match) => {
                const { aName, bName, winner } = formatMatchResult(match, collections);
                const date = new Date(match.createdAt);
                const dateStr = Number.isNaN(date.getTime())
                  ? match.createdAt
                  : date.toLocaleString(undefined, {
                      dateStyle: 'medium',
                      timeStyle: 'short',
                    });
                return (
                  <tr key={match.id} className="hover:bg-slate-50">
                    <td className="py-2.5 pr-4 text-slate-600">{dateStr}</td>
                    <td className="py-2.5 pr-4 font-medium text-slate-900">{aName}</td>
                    <td className="py-2.5 pr-4 text-slate-400">vs</td>
                    <td className="py-2.5 pr-4 font-medium text-slate-900">{bName}</td>
                    <td className="py-2.5 font-medium text-slate-900">{winner}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
