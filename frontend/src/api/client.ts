import type { ErrorDto } from './types';

const API_BASE = import.meta.env.VITE_API_URL ?? 'https://comp3011.evanmadurai.co.uk';

function getToken(): string | null {
  return localStorage.getItem('access_token');
}

export async function apiFetch<T>(
  path: string,
  options: RequestInit & { token?: string | null } = {}
): Promise<T> {
  const { token = getToken(), ...init } = options;
  const url = `${API_BASE}${path}`;
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(init.headers as Record<string, string>),
  };
  if (token) {
    (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
  }
  const res = await fetch(url, { ...init, headers });
  const text = await res.text();
  let body: unknown = null;
  if (text) {
    try {
      body = JSON.parse(text);
    } catch {
      // leave body null
    }
  }
  if (!res.ok) {
    const err = (body as ErrorDto) || { statusCode: res.status, error: 'Error', message: res.statusText };
    throw new ApiError(res.status, err.message, err);
  }
  return body as T;
}

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public body?: ErrorDto
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// Auth
export function authLogin(username: string, password: string) {
  return apiFetch<{ access_token: string }>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
    token: null,
  });
}

export function authRegister(username: string, password: string) {
  return apiFetch<{ access_token: string }>('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
    token: null,
  });
}

// Players (require auth)
export function playersList(params: { page?: number; limit?: number; name?: string; birthCountry?: string } = {}) {
  const sp = new URLSearchParams();
  if (params.page != null) sp.set('page', String(params.page));
  if (params.limit != null) sp.set('limit', String(params.limit));
  if (params.name) sp.set('name', params.name);
  if (params.birthCountry) sp.set('birthCountry', params.birthCountry);
  const q = sp.toString();
  return apiFetch<import('./types').PaginatedPlayerResponseDto>(`/player${q ? `?${q}` : ''}`);
}

export function playerById(id: string) {
  return apiFetch<import('./types').PlayerResponseDto>(`/player/${encodeURIComponent(id)}`);
}

// Teams (public)
export function teamsList(params: { page?: number; limit?: number; league?: string; year?: number } = {}) {
  const sp = new URLSearchParams();
  if (params.page != null) sp.set('page', String(params.page));
  if (params.limit != null) sp.set('limit', String(params.limit));
  if (params.league) sp.set('league', params.league);
  if (params.year != null) sp.set('year', String(params.year));
  const q = sp.toString();
  return apiFetch<import('./types').PaginatedTeamResponseDto>(`/teams${q ? `?${q}` : ''}`);
}

export function teamByIdYear(id: string, year: number) {
  return apiFetch<import('./types').TeamResponseDto>(`/teams/${encodeURIComponent(id)}/${year}`);
}

// Collections (require auth)
export function collectionsList(params: { page?: number; limit?: number; name?: string } = {}) {
  const sp = new URLSearchParams();
  if (params.page != null) sp.set('page', String(params.page));
  if (params.limit != null) sp.set('limit', String(params.limit));
  if (params.name) sp.set('name', params.name);
  const q = sp.toString();
  return apiFetch<import('./types').PaginatedCollectionResponseDto>(`/collection${q ? `?${q}` : ''}`);
}

export function collectionById(id: string) {
  return apiFetch<import('./types').CollectionResponseDto>(`/collection/${encodeURIComponent(id)}`);
}

export function collectionCreate(dto: import('./types').CreateCollectionDto) {
  return apiFetch<import('./types').CollectionResponseDto>('/collection', {
    method: 'POST',
    body: JSON.stringify(dto),
  });
}

export function collectionUpdate(id: string, dto: import('./types').UpdateCollectionDto) {
  return apiFetch<import('./types').CollectionResponseDto>(`/collection/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    body: JSON.stringify(dto),
  });
}

export function collectionDelete(id: string) {
  return apiFetch<unknown>(`/collection/${encodeURIComponent(id)}`, { method: 'DELETE' });
}
