/* Initializes the PostgreSQL schema and seeds default data.
   Idempotent: only seeds when tables are empty. Create admin user if missing. */
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { Pool } = require('pg');
const seed = require('../lib/seed-data');

// --- load .env (.env.production first, then .env) ---
const envCandidates = [
  path.join(__dirname, '..', '.env.production'),
  path.join(__dirname, '..', '.env'),
];
for (const envFile of envCandidates) {
  if (fs.existsSync(envFile)) {
    for (const line of fs.readFileSync(envFile, 'utf8').split('\n')) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
      if (m && !(m[1] in process.env)) process.env[m[1]] = m[2];
    }
  }
}

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

function hashPassword(pw) {
  const salt = crypto.randomBytes(16).toString('hex');
  const h = crypto.scryptSync(pw, salt, 64).toString('hex');
  return `scrypt:${salt}:${h}`;
}

(async () => {
  const schema = fs.readFileSync(path.join(__dirname, '..', 'db', 'schema.sql'), 'utf8');
  await pool.query(schema);
  console.log('✓ schema applied');

  const count = async (t) => (await pool.query(`SELECT COUNT(*)::int AS n FROM ${t}`)).rows[0].n;

  if ((await count('categories')) === 0) {
    const ids = {};
    for (let i = 0; i < seed.categories.length; i++) {
      const c = seed.categories[i];
      const r = await pool.query(
        `INSERT INTO categories (slug, code, name_ru, note_ru, icon, position)
         VALUES ($1,$2,$3,$4,$5,$6) RETURNING id`,
        [c.slug, c.code, c.name_ru, c.note_ru, c.icon, i + 1]
      );
      ids[c.slug] = r.rows[0].id;
    }
    let p = 0;
    for (const pr of seed.products) {
      p += 1;
      const slug = pr.code.replace(/[./]/g, '-');
      await pool.query(
        `INSERT INTO products (slug, category_id, code, name_ru, description_ru, icon, position)
         VALUES ($1,$2,$3,$4,$5,$6,$7)`,
        [slug, ids[pr.category_slug], pr.code, pr.name_ru, pr.description_ru, '⚡', p]
      );
    }
    console.log(`✓ seeded ${seed.categories.length} categories, ${seed.products.length} products`);
  } else {
    console.log('• categories/products already present, skipping product seed');
  }

  // page content defaults (only missing keys)
  for (const [key, data] of Object.entries(seed.contentDefaults)) {
    const ex = await pool.query('SELECT 1 FROM page_content WHERE key = $1', [key]);
    if (!ex.rows.length) {
      await pool.query('INSERT INTO page_content (key, data) VALUES ($1,$2)', [key, JSON.stringify(data)]);
    }
  }
  console.log('✓ page content defaults ensured');

  // admin user
  const email = process.env.ADMIN_EMAIL || 'admin@newsite.nail-app.ru';
  const ex = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
  if (!ex.rows.length) {
    const pw = process.env.ADMIN_PASSWORD;
    if (!pw) {
      console.error('ADMIN_PASSWORD не задан: добавьте его в .env.production');
      process.exit(1);
    }
    await pool.query(
      'INSERT INTO users (email, password_hash, display_name, role) VALUES ($1,$2,$3,$4)',
      [email, hashPassword(pw), 'Администратор', 'admin']
    );
    console.log(`✓ admin user created: ${email}`);
  } else {
    console.log(`• admin user exists: ${email}`);
  }

  await pool.end();
  console.log('done.');
})().catch((e) => {
  console.error('INIT FAILED:', e);
  process.exit(1);
});
