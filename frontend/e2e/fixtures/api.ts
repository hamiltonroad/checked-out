import { request, APIRequestContext } from '@playwright/test';
import { DEV_PASSWORD, SEED_PATRONS, PatronRole } from './testData';

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
  const ctx = await request.newContext({
    baseURL: API_BASE_URL.endsWith('/') ? API_BASE_URL : `${API_BASE_URL}/`,
  });
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

/**
 * Authenticated variant of apiRequest. Logs in as the given seed role
 * (priming CSRF first), then issues the request reusing the same
 * request context so the auth cookie is honored.
 *
 * Use for setup/teardown that touches authenticated endpoints
 * (e.g., POST /checkouts, PUT /checkouts/:id/return).
 */
/**
 * Open an authenticated APIRequestContext as the given seed role and
 * pass it to a callback. The single context (and single login) is
 * reused for every request the callback makes, dramatically reducing
 * strict-rate-limiter pressure compared to apiRequestAs which logs
 * in fresh on every call.
 */
export async function withApiSession<T>(
  role: PatronRole,
  fn: (session: {
    request: <R = unknown>(method: Method, path: string, body?: unknown) => Promise<R>;
  }) => Promise<T>
): Promise<T> {
  const ctx = await request.newContext({
    baseURL: API_BASE_URL.endsWith('/') ? API_BASE_URL : `${API_BASE_URL}/`,
  });
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

export async function apiRequestAs<T = unknown>(
  role: PatronRole,
  method: Method,
  path: string,
  body?: unknown
): Promise<T> {
  const ctx = await request.newContext({
    baseURL: API_BASE_URL.endsWith('/') ? API_BASE_URL : `${API_BASE_URL}/`,
  });
  try {
    const csrf = await primeCsrf(ctx);
    const loginRes = await ctx.fetch('auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-CSRF-Token': csrf },
      data: JSON.stringify({
        card_number: SEED_PATRONS[role].cardNumber,
        password: DEV_PASSWORD,
      }),
    });
    if (!loginRes.ok()) {
      throw new Error(`apiRequestAs login(${role}) failed: HTTP ${loginRes.status()}`);
    }
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
      throw new Error(`apiRequestAs ${method} ${path} failed: HTTP ${response.status()}`);
    }
    const payload = (await response.json()) as ApiEnvelope<T>;
    if (payload.success === false) {
      throw new Error(
        `apiRequestAs ${method} ${path} envelope error: ${payload.error?.message ?? 'unknown'}`
      );
    }
    return payload.data as T;
  } finally {
    await ctx.dispose();
  }
}
