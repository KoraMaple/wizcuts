/* Lightweight typed API client scaffold. Not imported yet.
 * Later we can replace inline fetches with this client, and/or generate types from OpenAPI.
 */

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export interface ApiClientOptions {
  baseUrl?: string;
  headers?: Record<string, string>;
}

export class ApiClient {
  private baseUrl: string;
  private defaultHeaders: Record<string, string>;

  constructor(opts: ApiClientOptions = {}) {
    const root =
      opts.baseUrl ??
      process.env.NEXT_PUBLIC_API_URL ??
      'http://localhost:3005';
    const normalizedRoot = root.endsWith('/') ? root.slice(0, -1) : root;
    // Backend uses globalPrefix 'api' and URI versioning 'v1'
    this.baseUrl = `${normalizedRoot}/api/v1`;
    this.defaultHeaders = {
      'Content-Type': 'application/json',
      ...(opts.headers ?? {}),
    };
  }

  async request<T>(
    path: string,
    method: HttpMethod,
    body?: unknown,
    init?: RequestInit
  ): Promise<T> {
    const res = await fetch(this.baseUrl + path, {
      method,
      headers: this.defaultHeaders,
      body: body !== undefined ? JSON.stringify(body) : undefined,
      ...init,
    });
    if (!res.ok) {
      const text = await res.text().catch(() => '');
      throw new Error(
        `API ${method} ${path} failed: ${res.status} ${res.statusText} ${text}`
      );
    }
    const contentType = res.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      return (await res.json()) as T;
    }
    // For non-JSON responses, return raw text cast to T by caller contract
    return (await res.text()) as unknown as T;
  }

  get<T>(path: string, init?: RequestInit) {
    return this.request<T>(path, 'GET', undefined, init);
  }
  post<T>(path: string, body?: unknown, init?: RequestInit) {
    return this.request<T>(path, 'POST', body, init);
  }
  put<T>(path: string, body?: unknown, init?: RequestInit) {
    return this.request<T>(path, 'PUT', body, init);
  }
  patch<T>(path: string, body?: unknown, init?: RequestInit) {
    return this.request<T>(path, 'PATCH', body, init);
  }
  delete<T>(path: string, init?: RequestInit) {
    return this.request<T>(path, 'DELETE', undefined, init);
  }
}

export const api = new ApiClient();
