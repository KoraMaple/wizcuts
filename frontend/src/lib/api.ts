// Small JSON API client for the frontend
const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/+$/, '') ||
  'http://localhost:3005';
// Respect Nest global prefix + URI versioning (see backend/src/main.ts)
const API_PREFIX = (process.env.NEXT_PUBLIC_API_PREFIX || 'api/v1').replace(
  /^\/+|\/+$/g,
  ''
);

type Query = Record<string, string | number | boolean | undefined | null>;

function buildUrl(path: string, query?: Query) {
  const normalizedPath = path.startsWith('/') ? path.slice(1) : path;
  const url = new URL(`${API_BASE}/${API_PREFIX}/${normalizedPath}`);
  if (query) {
    Object.entries(query).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '')
        url.searchParams.set(k, String(v));
    });
  }
  return url.toString();
}

async function jsonFetch<T>(input: string, init?: RequestInit): Promise<T> {
  const res = await fetch(input, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers || {}),
    },
  });
  if (!res.ok) {
    let text = '';
    try {
      text = await res.text();
    } catch {}
    throw new Error(`HTTP ${res.status}: ${text || res.statusText}`);
  }
  return res.json() as Promise<T>;
}

export const api = {
  get: <T>(path: string, query?: Query, init?: RequestInit) =>
    jsonFetch<T>(buildUrl(path, query), init),
  post: <T>(path: string, body?: unknown, init?: RequestInit) =>
    jsonFetch<T>(buildUrl(path), {
      method: 'POST',
      body: JSON.stringify(body ?? {}),
      ...(init || {}),
    }),
  put: <T>(path: string, body?: unknown, init?: RequestInit) =>
    jsonFetch<T>(buildUrl(path), {
      method: 'PUT',
      body: JSON.stringify(body ?? {}),
      ...(init || {}),
    }),
  patch: <T>(path: string, body?: unknown, init?: RequestInit) =>
    jsonFetch<T>(buildUrl(path), {
      method: 'PATCH',
      body: JSON.stringify(body ?? {}),
      ...(init || {}),
    }),
  del: <T>(path: string, init?: RequestInit) =>
    jsonFetch<T>(buildUrl(path), { method: 'DELETE', ...(init || {}) }),
};
