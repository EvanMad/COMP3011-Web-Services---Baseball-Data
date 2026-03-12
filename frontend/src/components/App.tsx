import { useState } from 'react';
import { AuthProvider, useAuth } from 'contexts/AuthContext';
import AuthForm from 'components/AuthForm';
import MLBTab from 'components/mlb/MLBTab';
import FantasyTab from 'components/fantasy/FantasyTab';
import LeaderboardsTab from 'components/leaderboards/LeaderboardsTab';
import { classNames } from 'utils';

type Tab = 'mlb' | 'leaderboards' | 'fantasy';

function AppContent() {
  const [tab, setTab] = useState<Tab>('mlb');

  return (
    <div className="min-h-screen bg-slate-100">
      <header className="border-b border-slate-200 bg-white shadow-sm">
        <div className="mx-auto flex max-w-4xl flex-wrap items-center justify-between gap-4 px-4 py-4">
          <h1 className="text-xl font-bold text-slate-900">Evan's Super Cool Baseball API</h1>
          <AuthForm />
        </div>
      </header>
      <main className="mx-auto max-w-4xl px-4 py-6">
        <div className="flex gap-1 border-b border-slate-200 mb-6">
          <button
            type="button"
            onClick={() => setTab('mlb')}
            className={classNames(
              'border-b-2 px-4 py-2 text-sm font-medium',
              tab === 'mlb'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-600 hover:border-slate-300 hover:text-slate-900'
            )}
          >
            MLB
          </button>
          <button
            type="button"
            onClick={() => setTab('leaderboards')}
            className={classNames(
              'border-b-2 px-4 py-2 text-sm font-medium',
              tab === 'leaderboards'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-600 hover:border-slate-300 hover:text-slate-900'
            )}
          >
            Leaderboards
          </button>
          <button
            type="button"
            onClick={() => setTab('fantasy')}
            className={classNames(
              'border-b-2 px-4 py-2 text-sm font-medium',
              tab === 'fantasy'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-600 hover:border-slate-300 hover:text-slate-900'
            )}
          >
            Fantasy
          </button>
        </div>
        {tab === 'mlb' && <MLBTab />}
        {tab === 'leaderboards' && <LeaderboardsTab />}
        {tab === 'fantasy' && <FantasyTab />}
      </main>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
