/* One-time migration: remove English content (site is Russian-only now).
   - Drops *_en columns from categories/products (IF EXISTS, safe to re-run).
   - Recursively deletes keys ending with "_en" from page_content JSONB.
   Usage on server: node scripts/migrate-drop-en.js
   Reads DATABASE_URL from .env.production (or .env). */
const fs = require('node:fs');
const path = require('node:path');
const { Pool } = require('pg');

for (const envFile of [
  path.join(__dirname, '..', '.env.production'),
  path.join(__dirname, '..', '.env'),
]) {
  if (fs.existsSync(envFile)) {
    for (const line of fs.readFileSync(envFile, 'utf8').split('\n')) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
      if (m && !(m[1] in process.env)) process.env[m[1]] = m[2];
    }
  }
}

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// Returns [cleanedValue, removedCount]
function stripEn(v) {
  let removed = 0;
  if (Array.isArray(v)) {
    const out = v.map((x) => {
      const [c, n] = stripEn(x);
      removed += n;
      return c;
    });
    return [out, removed];
  }
  if (v && typeof v === 'object') {
    const out = {};
    for (const [k, val] of Object.entries(v)) {
      if (/_en$/.test(k)) {
        removed += 1;
        continue;
      }
      const [c, n] = stripEn(val);
      removed += n;
      out[k] = c;
    }
    return [out, removed];
  }
  return [v, 0];
}

(async () => {
  await pool.query('ALTER TABLE categories DROP COLUMN IF EXISTS name_en, DROP COLUMN IF EXISTS note_en');
  console.log('✓ categories: EN columns dropped');
  await pool.query('ALTER TABLE products DROP COLUMN IF EXISTS name_en, DROP COLUMN IF EXISTS description_en');
  console.log('✓ products: EN columns dropped');

  const r = await pool.query('SELECT key, data FROM page_content');
  let keys = 0;
  let total = 0;
  for (const row of r.rows) {
    const [cleaned, n] = stripEn(row.data);
    if (n > 0) {
      await pool.query('UPDATE page_content SET data = $2, updated_at = now() WHERE key = $1', [
        row.key,
        JSON.stringify(cleaned),
      ]);
      keys += 1;
      total += n;
    }
  }
  console.log(`✓ page_content: removed ${total} EN fields in ${keys} keys`);
  await pool.end();
})().catch((e) => {
  console.error('migration failed:', e.message || e);
  process.exit(1);
});
