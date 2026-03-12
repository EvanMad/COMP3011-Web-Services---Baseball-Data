import CollectionsList from './CollectionsList';
import MatchPlay from './MatchPlay';

export default function FantasyTab() {
  return (
    <div className="space-y-6">
      <p className="text-sm text-slate-600">
        Create and manage your fantasy collections, then play them against each other using the match service.
      </p>
      <MatchPlay />
      <CollectionsList />
    </div>
  );
}
