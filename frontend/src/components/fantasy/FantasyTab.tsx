import CollectionsList from './CollectionsList';

export default function FantasyTab() {
  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-600">
        Create and manage your fantasy collections. Each collection has a name, optional description, and a list of player IDs (e.g. from the MLB tab).
      </p>
      <CollectionsList />
    </div>
  );
}
