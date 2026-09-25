import { Pool } from 'pg';

const globalForPg = globalThis as unknown as { __pgPool?: Pool };

export const pool =
  globalForPg.__pgPool ??
  new Pool({
    connectionString: process.env.DATABASE_URL,
    max: 10,
  });

if (process.env.NODE_ENV !== 'production') globalForPg.__pgPool = pool;

export function q(text: string, params?: unknown[]) {
  return pool.query(text, params);
}

// --- Simple content cache (admin edits propagate within 30s) ---
const contentCache = new Map<string, { at: number; val: unknown }>();
const CONTENT_TTL = 30_000;

export async function getContentCached(key: string): Promise<unknown> {
  const hit = contentCache.get(key);
  if (hit && Date.now() - hit.at < CONTENT_TTL) return hit.val;
  try {
    const res = await q('SELECT data FROM page_content WHERE key = $1', [key]);
    const val = res.rows.length ? (res.rows[0].data as unknown) : null;
    contentCache.set(key, { at: Date.now(), val });
    return val;
  } catch (err) {
    console.error(`DB error for key ${key}:`, err);
    return null;
  }
}

export function invalidateContent(key?: string) {
  if (key) contentCache.delete(key);
  else contentCache.clear();
}

let uploadsTableChecked = false;
export async function ensureUploadsTable() {
  if (uploadsTableChecked) return;
  try {
    await q(`
      CREATE TABLE IF NOT EXISTS uploads (
        id            SERIAL PRIMARY KEY,
        filename      TEXT NOT NULL UNIQUE,
        original_name TEXT NOT NULL,
        mime_type     TEXT NOT NULL,
        size_bytes    INTEGER NOT NULL,
        data          BYTEA NOT NULL,
        created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
      );
      CREATE INDEX IF NOT EXISTS idx_uploads_filename ON uploads(filename);
    `);
    uploadsTableChecked = true;
  } catch (err) {
    console.error('Error ensuring uploads table:', err);
  }
}
