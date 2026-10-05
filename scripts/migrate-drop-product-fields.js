/* Removes the two product fields that are no longer used
   («Поставка и гарантии» and «Галочки под описанием») plus their shared settings.
   The popup content is now edited with the visual editor (products.detail_html).

   Usage on server: node scripts/migrate-drop-product-fields.js
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
  await pool.query('ALTER TABLE products DROP COLUMN IF EXISTS supply_ru, DROP COLUMN IF EXISTS features_ru');
  console.log('✓ продукты: поля «Поставка и гарантии» и «Галочки» удалены');

  const r = await pool.query("DELETE FROM page_content WHERE key = 'product_extra' RETURNING key");
  console.log(r.rows.length ? '✓ общие настройки товаров удалены' : '✓ общих настроек товаров и так не было');

  await pool.end();
})().catch((e) => {
  console.error('миграция не выполнена:', e.message || e);
  process.exit(1);
});
