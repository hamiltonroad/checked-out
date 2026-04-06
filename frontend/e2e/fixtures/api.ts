import { request, APIRequestContext } from '@playwright/test';

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
