/**
 * Lightweight fetch wrapper for the Pizza Height API (admin app).
 * Same pattern as apps/web — Bearer injection + refresh-on-401, but auth
 * comes from the admin's own staff-auth store.
 */

import { useAuthStore } from '@/store/auth-store';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api/v1';

export const API_BASE_URL = API_URL;

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
    public readonly body?: unknown,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

type ApiInit = Omit<RequestInit, 'body'> & {
  body?: unknown;
  query?: Record<string, string | number | boolean | undefined>;
  skipAuth?: boolean;
};

function buildUrl(path: string, query?: ApiInit['query']) {
  const url = new URL(`${API_URL}${path}`);
  if (query) {
    for (const [k, v] of Object.entries(query)) {
      if (v !== undefined && v !== '' && v !== false) url.searchParams.set(k, String(v));
    }
  }
  return url.toString();
}

let refreshInflight: Promise<string | null> | null = null;

async function tryRefresh(): Promise<string | null> {
  if (refreshInflight) return refreshInflight;
  const refreshToken = useAuthStore.getState().refreshToken;
  if (!refreshToken) return null;

  refreshInflight = (async () => {
    try {
      const res = await fetch(buildUrl('/auth/refresh'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      });
      if (res.status === 401 || res.status === 403) {
        useAuthStore.getState().clear();
        return null;
      }
      if (!res.ok) return null;
      const data = (await res.json()) as {
        accessToken: string;
        refreshToken: string;
      };
      useAuthStore.getState().setTokens(data.accessToken, data.refreshToken);
      return data.accessToken;
    } catch {
      return null;
    } finally {
      refreshInflight = null;
    }
  })();

  return refreshInflight;
}

async function send(path: string, init: ApiInit, token: string | null): Promise<Response> {
  const { body, query, headers, skipAuth, ...rest } = init;
  const merged: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(headers as Record<string, string> | undefined),
  };
  if (token && !skipAuth) merged['Authorization'] = `Bearer ${token}`;

  return fetch(buildUrl(path, query), {
    ...rest,
    headers: merged,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
}

export async function api<T>(path: string, init: ApiInit = {}): Promise<T> {
  const token = init.skipAuth ? null : useAuthStore.getState().accessToken;
  let response = await send(path, init, token);

  if (response.status === 401 && !init.skipAuth) {
    const newToken = await tryRefresh();
    if (newToken) response = await send(path, init, newToken);
  }

  if (!response.ok) {
    let payload: unknown;
    try {
      payload = await response.json();
    } catch {
      payload = await response.text().catch(() => null);
    }
    const message =
      typeof payload === 'object' && payload && 'message' in payload
        ? String((payload as { message: unknown }).message)
        : `Request failed with status ${response.status}`;
    throw new ApiError(response.status, message, payload);
  }

  if (response.status === 204) return undefined as T;
  return (await response.json()) as T;
}
