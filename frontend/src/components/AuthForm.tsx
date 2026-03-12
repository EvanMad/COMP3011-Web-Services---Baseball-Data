import { useState } from 'react';
import { useAuth } from 'contexts/AuthContext';

type Mode = 'login' | 'register';

export default function AuthForm() {
  const { login, register, logout, isAuthenticated, error, clearError } = useAuth();
  const [mode, setMode] = useState<Mode>('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    setLoading(true);
    try {
      if (mode === 'login') await login(username, password);
      else await register(username, password);
    } catch {
      // error set in context
    } finally {
      setLoading(false);
    }
  };

  if (isAuthenticated) {
    return (
      <div className="flex items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 px-4 py-2">
        <span className="text-sm text-slate-600">Signed in</span>
        <button
          type="button"
          onClick={logout}
          className="rounded bg-slate-200 px-3 py-1 text-sm font-medium text-slate-700 hover:bg-slate-300"
        >
          Log out
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="flex flex-wrap items-end gap-3 rounded-lg border border-slate-200 bg-slate-50 p-4">
      <div className="flex flex-col gap-1">
        <label htmlFor="auth-username" className="text-xs font-medium text-slate-600">
          Username
        </label>
        <input
          id="auth-username"
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
          className="rounded border border-slate-300 px-3 py-1.5 text-sm"
          autoComplete="username"
        />
      </div>
      <div className="flex flex-col gap-1">
        <label htmlFor="auth-password" className="text-xs font-medium text-slate-600">
          Password
        </label>
        <input
          id="auth-password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="rounded border border-slate-300 px-3 py-1.5 text-sm"
          autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
        />
      </div>
      <div className="flex items-center gap-2">
        <button
          type="submit"
          disabled={loading}
          className="rounded bg-indigo-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
        >
          {loading ? '…' : mode === 'login' ? 'Log in' : 'Register'}
        </button>
        <button
          type="button"
          onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); clearError(); }}
          className="text-sm text-indigo-600 hover:underline"
        >
          {mode === 'login' ? 'Register' : 'Log in'}
        </button>
      </div>
      {error && <p className="w-full text-sm text-red-600">{error}</p>}
    </form>
  );
}
