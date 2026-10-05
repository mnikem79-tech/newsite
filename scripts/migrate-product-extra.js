/* Adds optional per-product fields for the "supply" note and the feature checkmarks
   on the product page. Empty value = use the shared text from «Контент → Товары».

   Usage on server: node scripts/migrate-product-extra.js
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
  await pool.query('ALTER TABLE products ADD COLUMN IF NOT EXISTS supply_ru TEXT');
  console.log('✓ products.supply_ru готова');
  await pool.query('ALTER TABLE products ADD COLUMN IF NOT EXISTS features_ru JSONB');
  console.log('✓ products.features_ru готова');

  // shared default lives in page_content, key = product_extra
  await pool.query(
    `INSERT INTO page_content (key, data) VALUES ('product_extra', $1)
     ON CONFLICT (key) DO NOTHING`,
    [
      JSON.stringify({
        supply_ru:
          'Поставка по всей России и странам СНГ. Оборудование сопровождается полным пакетом разрешительной документации, сертификатами и декларациями о соответствии.',
        features_ru: [
          'Работа по ГОСТ и ТР, полная документация',
          'Возможна разработка по требованиям заказчика',
          'Инженерное сопровождение: расчёты, пусконаладка',
        ],
      }),
    ]
  );
  console.log('✓ общий текст про поставку и галочки создан (ключ product_extra)');
  await pool.end();
})().catch((e) => {
  console.error('миграция не выполнена:', e.message || e);
  process.exit(1);
});
