/* Creates the `pages` table and fills it with the pages that already exist on the site.
   After this the site pages are managed from the admin panel:
   add / rename / hide / delete / reorder.

   Usage on server: node scripts/migrate-pages.js
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

// slug, название, в меню, системная (неудаляемая)
const SEED = [
  ['home', 'Главная', false, true],
  ['about', 'О компании', true, false],
  ['production', 'Производство', true, false],
  ['services', 'Услуги', true, false],
  ['materials', 'Материалы', true, false],
  ['contacts', 'Контакты', true, false],
  ['catalog', 'Каталог', true, true],
  ['cart', 'Корзина', false, true],
  ['checkout', 'Оформление', false, true],
];

(async () => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS pages (
      id              SERIAL PRIMARY KEY,
      slug            TEXT NOT NULL UNIQUE,
      title_ru        TEXT NOT NULL,
      is_active       BOOLEAN NOT NULL DEFAULT TRUE,
      in_menu         BOOLEAN NOT NULL DEFAULT TRUE,
      position        INTEGER NOT NULL DEFAULT 0,
      is_system       BOOLEAN NOT NULL DEFAULT FALSE,
      created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
      updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `);
  console.log('✓ таблица pages готова');

  let added = 0;
  let pos = 0;
  for (const [slug, title, inMenu, isSystem] of SEED) {
    pos += 1;
    const r = await pool.query(
      `INSERT INTO pages (slug, title_ru, is_active, in_menu, position, is_system)
       VALUES ($1,$2,TRUE,$3,$4,$5)
       ON CONFLICT (slug) DO NOTHING
       RETURNING id`,
      [slug, title, inMenu, pos, isSystem]
    );
    if (r.rows.length) added += 1;
  }
  console.log(added ? `✓ добавлено страниц: ${added}` : '✓ страницы уже были в базе, ничего не добавлено');

  const c = await pool.query('SELECT COUNT(*)::int AS n FROM pages');
  console.log(`✓ всего страниц в базе: ${c.rows[0].n}`);
  await pool.end();
})().catch((e) => {
  console.error('миграция не выполнена:', e.message || e);
  process.exit(1);
});
