import { request, APIRequestContext, Page } from '@playwright/test';

/**
 * Minimal API helper for e2e tests. Handles CSRF priming and ApiResponse
 * envelope parsing. Use for setup/teardown; UI interactions should go
 * through the browser page.
 */

export const API_BASE_URL = process.env.API_BASE_URL ?? 'http://localhost:3000/api/v1';

type Method = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

interface ApiEnvelope<T> {
  success: boolean;
  data?: T;
  error?: { message?: string };
}

async function primeCsrf(ctx: APIRequestContext): Promise<string> {
  await ctx.get('/books?limit=1');
  const state = await ctx.storageState();
  const cookie = state.cookies.find((c) => c.name === '_csrf');
  return cookie?.value ?? '';
}

export async function apiRequest<T = unknown>(
  method: Method,
  path: string,
  body?: unknown
): Promise<T> {
  const ctx = await request.newContext({ baseURL: API_BASE_URL });
  try {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (method !== 'GET') {
      headers['X-CSRF-Token'] = await primeCsrf(ctx);
    }
    const response = await ctx.fetch(path, {
      method,
      headers,
      data: body !== undefined ? JSON.stringify(body) : undefined,
    });
    if (!response.ok()) {
      throw new Error(`apiRequest ${method} ${path} failed: HTTP ${response.status()}`);
    }
    const payload = (await response.json()) as ApiEnvelope<T>;
    if (payload.success === false) {
      throw new Error(
        `apiRequest ${method} ${path} envelope error: ${payload.error?.message ?? 'unknown'}`
      );
    }
    return payload.data as T;
  } finally {
    await ctx.dispose();
  }
}

export interface RawApiResponse<T = unknown> {
  status: number;
  ok: boolean;
  payload: (ApiEnvelope<T> & Record<string, unknown>) | null;
}

export interface RawOptions {
  body?: unknown;
  ctx?: APIRequestContext;
  page?: Page;
}

async function primeCsrfFromCookies(ctx: APIRequestContext): Promise<string> {
  await ctx.get(`${API_BASE_URL}/books?limit=1`);
  const state = await ctx.storageState();
  const cookie = state.cookies.find((c) => c.name === '_csrf');
  return cookie?.value ?? '';
}

/**
 * Raw-mode API helper for security tests. Does NOT throw on non-2xx responses
 * or on `success: false` envelopes — returns the status and parsed payload so
 * tests can assert error contracts (401/403, etc).
 *
 * Pass `{ page }` to reuse a logged-in page's request context (cookies persist),
 * or `{ ctx }` to reuse an explicit APIRequestContext. Otherwise creates a fresh
 * unauthenticated context.
 */
export async function apiRequestRaw<T = unknown>(
  method: Method,
  path: string,
  opts: RawOptions = {}
): Promise<RawApiResponse<T>> {
  let ctx: APIRequestContext;
  let disposable = false;
  if (opts.ctx) {
    ctx = opts.ctx;
  } else if (opts.page) {
    ctx = opts.page.request;
  } else {
    ctx = await request.newContext({ baseURL: API_BASE_URL });
    disposable = true;
  }
  try {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (method !== 'GET') {
      headers['X-CSRF-Token'] = await primeCsrfFromCookies(ctx);
    }
    const url = path.startsWith('http') ? path : `${API_BASE_URL}${path}`;
    const response = await ctx.fetch(url, {
      method,
      headers,
      data: opts.body !== undefined ? JSON.stringify(opts.body) : undefined,
    });
    let payload: (ApiEnvelope<T> & Record<string, unknown>) | null = null;
    try {
      payload = (await response.json()) as ApiEnvelope<T> & Record<string, unknown>;
    } catch {
      payload = null;
    }
    return { status: response.status(), ok: response.ok(), payload };
  } finally {
    if (disposable) {
      await ctx.dispose();
    }
  }
}
