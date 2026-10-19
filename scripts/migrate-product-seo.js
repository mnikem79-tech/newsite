/* Adds SEO fields to products: meta_title and meta_description.
   Both fall back to name_ru / description_ru when empty.

   Usage on server: node scripts/migrate-product-seo.js
   Safe to run more than once. Reads DATABASE_URL from .env.production (or .env). */
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

(async () => {
  await pool.query('ALTER TABLE products ADD COLUMN IF NOT EXISTS meta_title TEXT');
  console.log('✓ products.meta_title готова');
  await pool.query('ALTER TABLE products ADD COLUMN IF NOT EXISTS meta_description TEXT');
  console.log('✓ products.meta_description готова');
  await pool.end();
})().catch((e) => {
  console.error('миграция не выполнена:', e.message || e);
  process.exit(1);
});
