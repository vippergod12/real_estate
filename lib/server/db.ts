import { neon, type NeonQueryFunction } from "@neondatabase/serverless";

type SqlFn = NeonQueryFunction<false, false>;

/**
 * Lazy Neon SQL client.
 *
 * The real client is constructed on first use so importing this module is
 * always safe — `next build` can analyze data fetchers without exploding
 * when `DATABASE_URL` is missing (Vercel injects it at runtime).
 *
 * Callers should treat DB failures as recoverable. `lib/data.ts` wraps
 * queries in try/catch and returns empty results, so pages still render.
 */
let _sql: SqlFn | null = null;

function hasUrl() {
  return !!process.env.DATABASE_URL;
}

function getClient(): SqlFn {
  if (_sql) return _sql;
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error("DATABASE_URL_MISSING");
  }
  _sql = neon(url);
  return _sql;
}

export const sql = new Proxy(
  function sqlPlaceholder() {
    /* no-op */
  } as unknown as SqlFn,
  {
    apply(_target, _thisArg, args: unknown[]) {
      const client = getClient();
      return (client as unknown as (...a: unknown[]) => unknown)(...args);
    },
    get(_target, prop) {
      if (prop === "__hasUrl") return hasUrl;
      const client = getClient() as unknown as Record<string, unknown>;
      return client[prop as string];
    },
  }
);

export function isDbConfigured() {
  return hasUrl();
}
