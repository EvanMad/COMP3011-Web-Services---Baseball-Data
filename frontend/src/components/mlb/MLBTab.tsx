import { useState } from 'react';
import PlayersList from './PlayersList';
import TeamsList from './TeamsList';
import { classNames } from 'utils';

type SubTab = 'players' | 'teams';

export default function MLBTab() {
  const [subTab, setSubTab] = useState<SubTab>('players');

  return (
    <div className="space-y-4">
      <div className="flex gap-1 border-b border-slate-200">
        <button
          type="button"
          onClick={() => setSubTab('players')}
          className={classNames(
            'border-b-2 px-4 py-2 text-sm font-medium',
            subTab === 'players'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-600 hover:border-slate-300 hover:text-slate-900'
          )}
        >
          Players
        </button>
        <button
          type="button"
          onClick={() => setSubTab('teams')}
          className={classNames(
            'border-b-2 px-4 py-2 text-sm font-medium',
            subTab === 'teams'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-600 hover:border-slate-300 hover:text-slate-900'
          )}
        >
          Teams
        </button>
      </div>
      {subTab === 'players' && <PlayersList />}
      {subTab === 'teams' && <TeamsList />}
    </div>
  );
}
