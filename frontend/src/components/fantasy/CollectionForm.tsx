import { useState, useEffect } from 'react';
import { collectionCreate, collectionUpdate } from 'api/client';
import type { CollectionResponseDto, CreateCollectionDto } from 'api/types';

interface CollectionFormProps {
  initial?: CollectionResponseDto;
  onSaved: () => void;
  onCancel: () => void;
}

function parsePlayerIds(value: string): string[] {
  return value
    .split(/[\n,]+/)
    .map((s) => s.trim())
    .filter(Boolean);
}

function formatPlayerIds(ids: string[]): string {
  return ids.join('\n');
}

export default function CollectionForm({ initial, onSaved, onCancel }: CollectionFormProps) {
  const [name, setName] = useState(initial?.name ?? '');
  const [description, setDescription] = useState(initial?.description ?? '');
  const [playerIdsText, setPlayerIdsText] = useState(formatPlayerIds(initial?.playerIDs ?? []));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initial) {
      setName(initial.name);
      setDescription(initial.description ?? '');
      setPlayerIdsText(formatPlayerIds(initial.playerIDs));
    }
  }, [initial]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const playerIDs = parsePlayerIds(playerIdsText);
    if (playerIDs.length === 0) {
      setError('Add at least one player ID (one per line or comma-separated).');
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
        <label htmlFor="col-players" className="block text-xs font-medium text-slate-600">Player IDs * (one per line or comma-separated, 1–50)</label>
        <textarea
          id="col-players"
          value={playerIdsText}
          onChange={(e) => setPlayerIdsText(e.target.value)}
          rows={4}
          placeholder="ruthba01&#10;gehrilo01"
          className="mt-0.5 w-full rounded border border-slate-300 px-3 py-1.5 text-sm font-mono"
        />
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
