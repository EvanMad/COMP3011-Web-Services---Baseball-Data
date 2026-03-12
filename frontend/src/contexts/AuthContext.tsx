import { createContext, useCallback, useContext, useState } from 'react';
import { authLogin, authRegister } from 'api/client';

const TOKEN_KEY = 'access_token';

interface AuthContextValue {
  token: string | null;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, password: string) => Promise<void>;
  logout: () => void;
  error: string | null;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem(TOKEN_KEY));
  const [error, setError] = useState<string | null>(null);

  const login = useCallback(async (username: string, password: string) => {
    setError(null);
    try {
      const res = await authLogin(username, password);
      localStorage.setItem(TOKEN_KEY, res.access_token);
      setToken(res.access_token);
    } catch (e: unknown) {
      const msg = e && typeof e === 'object' && 'body' in e && e.body && typeof (e.body as { message?: string }).message === 'string'
        ? (e.body as { message: string }).message
        : e instanceof Error ? e.message : 'Login failed';
      setError(msg);
      throw e;
    }
  }, []);

  const register = useCallback(async (username: string, password: string) => {
    setError(null);
    try {
      const res = await authRegister(username, password);
      localStorage.setItem(TOKEN_KEY, res.access_token);
      setToken(res.access_token);
    } catch (e: unknown) {
      const msg = e && typeof e === 'object' && 'body' in e && e.body && typeof (e.body as { message?: string }).message === 'string'
        ? (e.body as { message: string }).message
        : e instanceof Error ? e.message : 'Registration failed';
      setError(msg);
      throw e;
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setError(null);
  }, []);

  const clearError = useCallback(() => setError(null), []);

  const value: AuthContextValue = {
    token,
    isAuthenticated: !!token,
    login,
    register,
    logout,
    error,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
