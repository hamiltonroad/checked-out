import { request, APIRequestContext } from '@playwright/test';
import { DEV_PASSWORD, SEED_PATRONS, PatronRole } from './testData';

/**
 * Minimal API helper for e2e tests. Handles CSRF priming and ApiResponse
 * envelope parsing. Use for setup/teardown; UI interactions should go
 * through the browser page.
 *
 * CSRF lifecycle: priming a context with one GET seeds the `_csrf` cookie.
 * Subsequent writes from the same context send the same cookie value as
 * the `X-CSRF-Token` header. After a successful login the cookie may be
 * rotated, so we re-read it from `storageState()` once and reuse the
 * fresh value for the rest of the session — never re-prime.
 */

export const API_BASE_URL = process.env.API_BASE_URL ?? 'http://localhost:3000/api/v1';

// Path resolution against baseURL relies on baseURL having a trailing
// slash; otherwise Playwright treats the last segment (`v1`) as a file
// and strips it. We enforce the trailing slash everywhere baseURL is set.
function resolvedBaseURL(): string {
  return API_BASE_URL.endsWith('/') ? API_BASE_URL : `${API_BASE_URL}/`;
}

type Method = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

interface ApiEnvelope<T> {
  success: boolean;
  data?: T;
  error?: { message?: string };
}

async function primeCsrf(ctx: APIRequestContext): Promise<string> {
  // Relative path — relies on the trailing-slash baseURL above.
  await ctx.get('books?limit=1');
  const state = await ctx.storageState();
  const cookie = state.cookies.find((c) => c.name === '_csrf');
  return cookie?.value ?? '';
}

export async function apiRequest<T = unknown>(
  method: Method,
  path: string,
  body?: unknown
): Promise<T> {
  const ctx = await request.newContext({ baseURL: resolvedBaseURL() });
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

export interface ApiSession {
  request: <R = unknown>(method: Method, path: string, body?: unknown) => Promise<R>;
}

/**
 * Open an authenticated APIRequestContext as the given seed role and
 * pass it to a callback. The single context (and single login) is
 * reused for every request the callback makes, dramatically reducing
 * strict-rate-limiter pressure compared to logging in fresh per call.
 */
export async function withApiSession<T>(
  role: PatronRole,
  fn: (session: ApiSession) => Promise<T>
): Promise<T> {
  const ctx = await request.newContext({ baseURL: resolvedBaseURL() });
  try {
    let csrf = await primeCsrf(ctx);
    const loginRes = await ctx.fetch('auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-CSRF-Token': csrf },
      data: JSON.stringify({
        card_number: SEED_PATRONS[role].cardNumber,
        password: DEV_PASSWORD,
      }),
    });
    if (!loginRes.ok()) {
      throw new Error(`withApiSession login(${role}) failed: HTTP ${loginRes.status()}`);
    }
    // Re-read the (possibly rotated) CSRF cookie from storageState rather
    // than re-priming with another GET — that would burn a rate-limiter slot.
    const post = await ctx.storageState();
    csrf = post.cookies.find((c) => c.name === '_csrf')?.value ?? csrf;

    const sessionRequest = async <R = unknown>(
      method: Method,
      path: string,
      body?: unknown
    ): Promise<R> => {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (method !== 'GET') headers['X-CSRF-Token'] = csrf;
      const res = await ctx.fetch(path, {
        method,
        headers,
        data: body !== undefined ? JSON.stringify(body) : undefined,
      });
      if (!res.ok()) {
        throw new Error(`withApiSession ${method} ${path} failed: HTTP ${res.status()}`);
      }
      const payload = (await res.json()) as ApiEnvelope<R>;
      if (payload.success === false) {
        throw new Error(
          `withApiSession ${method} ${path} envelope error: ${payload.error?.message ?? 'unknown'}`
        );
      }
      return payload.data as R;
    };
    return await fn({ request: sessionRequest });
  } finally {
    await ctx.dispose();
  }
}
