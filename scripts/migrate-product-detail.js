/* Adds the editable HTML block that is shown in the product card popup («Подробнее»).

   Usage on server: node scripts/migrate-product-detail.js
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
  await pool.query('ALTER TABLE products ADD COLUMN IF NOT EXISTS detail_html TEXT');
  console.log('✓ products.detail_html готова');
  await pool.end();
})().catch((e) => {
  console.error('миграция не выполнена:', e.message || e);
  process.exit(1);
});
