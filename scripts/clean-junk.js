/* Finds (and optionally removes) leftover markdown-link junk imported from the old site.
   Looks for constructs like  ++**[Текст](https://...)**++  inside page_content,
   products and categories.

   Usage on server:
     node scripts/clean-junk.js            # dry run: only shows what was found
     node scripts/clean-junk.js --apply    # actually cleans the data
*/
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

const APPLY = process.argv.includes('--apply');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// a markdown link, optionally wrapped in ** / ++ / __ decorations
const MD_LINK = /\**\s*(?:\+\+)?\s*\**\s*\[([^\]]{1,200})\]\(\s*([^)\s]{1,400})\s*\)\s*\**\s*(?:\+\+)?\s*\**/g;

function hasJunk(s) {
  return /\]\(\s*https?:/.test(s);
}

/** returns [cleaned, removedCount] */
function cleanString(s) {
  let removed = 0;
  const out = s.replace(MD_LINK, () => {
    removed += 1;
    return ' ';
  });
  // leftovers of decorations with nothing meaningful inside
  const tidied = out
    .replace(/\s*\*\*\s*/g, ' ')
    .replace(/\s*\+\+\s*/g, ' ')
    .replace(/[ \t]{2,}/g, ' ')
    .replace(/\s+([.,;:!?])/g, '$1')
    .replace(/^\s+|\s+$/g, '');
  return [tidied, removed];
}

function walk(v, trail, onString) {
  if (typeof v === 'string') {
    if (hasJunk(v)) onString(trail.join('.'), v);
    return;
  }
  if (Array.isArray(v)) {
    v.forEach((x, i) => walk(x, [...trail, `[${i}]`], onString));
    return;
  }
  if (v && typeof v === 'object') {
    for (const [k, val] of Object.entries(v)) walk(val, [...trail, k], onString);
  }
}

function cleanValue(v) {
  let removed = 0;
  const rec = (x) => {
    if (typeof x === 'string') {
      if (!hasJunk(x)) return x;
      const [c, n] = cleanString(x);
      removed += n;
      return c;
    }
    if (Array.isArray(x)) return x.map(rec);
    if (x && typeof x === 'object') {
      const o = {};
      for (const [k, val] of Object.entries(x)) o[k] = rec(val);
      return o;
    }
    return x;
  };
  const out = rec(v);
  return [out, removed];
}

function show(s, max = 160) {
  const one = s.replace(/\s+/g, ' ').trim();
  return one.length > max ? `${one.slice(0, max)}…` : one;
}

(async () => {
  console.log(APPLY ? '=== РЕЖИМ ИСПРАВЛЕНИЯ ===' : '=== РЕЖИМ ПРОВЕРКИ (ничего не меняется) ===');

  let total = 0;

  // 1) page_content (JSONB)
  const pc = await pool.query('SELECT key, data FROM page_content');
  for (const row of pc.rows) {
    const found = [];
    walk(row.data, [], (where, val) => found.push({ where, val }));
    if (!found.length) continue;
    for (const f of found) {
      total += 1;
      console.log(`\n• page_content[${row.key}] ${f.where}`);
      console.log(`    было: ${show(f.val)}`);
      const [cleaned] = cleanString(f.val);
      console.log(`    стало: ${show(cleaned)}`);
    }
    if (APPLY) {
      const [cleaned, n] = cleanValue(row.data);
      if (n > 0) {
        await pool.query('UPDATE page_content SET data = $2, updated_at = now() WHERE key = $1', [
          row.key,
          JSON.stringify(cleaned),
        ]);
        console.log(`    💾 сохранено (убрано фрагментов: ${n})`);
      }
    }
  }

  // 2) products / categories text fields
  for (const [table, cols] of [
    ['products', ['name_ru', 'description_ru', 'price_note', 'code']],
    ['categories', ['name_ru', 'note_ru', 'code']],
  ]) {
    const r = await pool.query(`SELECT id, ${cols.join(', ')} FROM ${table}`);
    for (const row of r.rows) {
      for (const c of cols) {
        const val = row[c];
        if (typeof val !== 'string' || !hasJunk(val)) continue;
        total += 1;
        console.log(`\n• ${table} #${row.id} «${c}»`);
        console.log(`    было: ${show(val)}`);
        const [cleaned] = cleanString(val);
        console.log(`    стало: ${show(cleaned)}`);
        if (APPLY) {
          await pool.query(`UPDATE ${table} SET ${c} = $2 WHERE id = $1`, [row.id, cleaned]);
          console.log('    💾 сохранено');
        }
      }
    }
  }

  console.log(`\n=== Найдено мест: ${total} ===`);
  if (total === 0) {
    console.log('Мусора со ссылками не найдено.');
  } else if (!APPLY) {
    console.log('Это был только показ. Чтобы вычистить, запустите: node scripts/clean-junk.js --apply');
  }
  await pool.end();
})().catch((e) => {
  console.error('ошибка:', e.message || e);
  process.exit(1);
});
