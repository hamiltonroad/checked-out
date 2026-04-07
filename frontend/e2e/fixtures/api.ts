import { request, APIRequestContext, Page } from '@playwright/test';
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

/**
 * Shared CSRF priming helper. Issues a safe GET so the backend sets the
 * `_csrf` cookie via `setCsrfCookie` middleware, then reads the cookie value
 * for use in the `X-CSRF-Token` header on subsequent state-changing requests.
 *
 * Single source of truth — both `apiRequest`/`withApiSession` and
 * `apiRequestRaw` MUST use this helper so the priming endpoint and cookie
 * name stay in lock-step. Uses an absolute URL so it works for contexts
 * without a configured baseURL (e.g. `page.request`).
 */
async function primeCsrf(ctx: APIRequestContext): Promise<string> {
  await ctx.get(`${API_BASE_URL}/books?limit=1`);
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

/**
 * Raw-mode API helper for security tests. Does NOT throw on non-2xx responses
 * or on `success: false` envelopes — returns the status and parsed payload so
 * tests can assert error contracts (401/403, etc).
 *
 * Context precedence (highest to lowest):
 *   1. `opts.ctx` — explicit APIRequestContext (e.g., from request.newContext)
 *   2. `opts.page` — reuses `page.request` so logged-in cookies persist
 *   3. fallback — creates a fresh unauthenticated context (disposed in finally)
 *
 * If both `ctx` and `page` are supplied, `ctx` wins.
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
    ctx = await request.newContext({ baseURL: resolvedBaseURL() });
    disposable = true;
  }
  try {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (method !== 'GET') {
      headers['X-CSRF-Token'] = await primeCsrf(ctx);
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

export interface ApiSession {
  request: <R = unknown>(method: Method, path: string, body?: unknown) => Promise<R>;
}

/**
 * Open an authenticated APIRequestContext as the given seed role and
 * pass it to a callback. The single context (and single login) is
 * reused for every request the callback makes, dramatically reducing
 * strict-rate-limiter pressure compared to logging in fresh per call.
 */
/**
 * Response shape for GET /api/v1/copies/checkoutable — kept local to the
 * fixture since it is only consumed by test helpers.
 */
interface CheckoutableCopyRow {
  id: number;
  copy_number: number | null;
  format: string;
  barcode: string | null;
  asin: string | null;
  book: { id: number; title: string } | null;
}

interface CheckoutableCopiesData {
  copies: CheckoutableCopyRow[];
  count: number;
}

export interface CheckoutableCopy {
  bookId: number;
  copyId: number;
  format: string;
  bookTitle: string;
}

/**
 * Fetch a single checkoutable copy via the read-only discovery endpoint.
 * Replaces the legacy `findUngatedCopy` probe loop (which burned strict
 * rate-limiter slots by creating+reverting real checkouts). Uses a
 * librarian session so the response is never gated on patron identity.
 *
 * Throws if the endpoint returns zero results — callers should treat that
 * as a hard failure (the seed catalog is expected to always contain at
 * least one checkoutable copy).
 */
export async function getCheckoutableCopy(
  opts: { bookId?: number; format?: string } = {}
): Promise<CheckoutableCopy> {
  return withApiSession('librarian', async (session) => {
    const qs = new URLSearchParams();
    qs.set('limit', '1');
    if (opts.bookId !== undefined) qs.set('bookId', String(opts.bookId));
    if (opts.format !== undefined) qs.set('format', opts.format);
    const data = await session.request<CheckoutableCopiesData>(
      'GET',
      `copies/checkoutable?${qs.toString()}`
    );
    const row = data?.copies?.[0];
    if (!row || !row.book) {
      throw new Error('getCheckoutableCopy: no checkoutable copy returned by API');
    }
    return {
      bookId: row.book.id,
      copyId: row.id,
      format: row.format,
      bookTitle: row.book.title,
    };
  });
}

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
