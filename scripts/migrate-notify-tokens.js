/* Moves the notification tokens/chat ids that were stored under the old
   `site` key (uneditable since the header/footer settings tab was removed)
   into the `notifications` key, which the admin panel actually edits.
   Existing values in `notifications` are never overwritten.

   Usage on server: node scripts/migrate-notify-tokens.js
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

// site.* -> notifications.*  (recipient lists are comma/space/semicolon separated)
const MAP = {
  telegram_bot_token: 'telegram_bot_token',
  telegram_chat_id: 'telegram_recipients',
  vk_bot_token: 'vk_bot_token',
  vk_user_id: 'vk_recipients',
};

function toRecipients(raw, fallbackName) {
  return String(raw)
    .split(/[,;\s]+/)
    .filter(Boolean)
    .map((id, idx) => ({
      id: id.trim(),
      name: idx === 0 ? fallbackName : `Сотрудник ${idx + 1}`,
      enabled: true,
    }));
}

(async () => {
  const read = async (key) => {
    const r = await pool.query('SELECT data FROM page_content WHERE key = $1', [key]);
    return r.rows.length ? r.rows[0].data || {} : {};
  };

  const site = await read('site');
  const notif = await read('notifications');
  const patch = {};

  for (const [from, to] of Object.entries(MAP)) {
    const src = site[from];
    if (src === undefined || src === null || String(src).trim() === '') continue;
    if (notif[to] !== undefined && notif[to] !== null && String(notif[to]).trim() !== '') continue;

    patch[to] = to.endsWith('_recipients')
      ? toRecipients(src, to.startsWith('vk') ? 'VK' : 'Telegram')
      : String(src).trim();
    console.log(`→ ${from} -> notifications.${to}`);
  }

  if (Object.keys(patch).length) {
    const merged = { ...notif, ...patch };
    await pool.query(
      `INSERT INTO page_content (key, data) VALUES ('notifications', $1::jsonb)
       ON CONFLICT (key) DO UPDATE SET data = 'notifications'::jsonb || $1::jsonb, updated_at = now()`,
      [JSON.stringify(merged)]
    );
    console.log('✓ настройки оповещений перенесены из ключа site');
  } else {
    console.log('✓ переносить нечего: в notifications всё уже заполнено');
  }

  await pool.end();
})().catch((e) => {
  console.error('миграция не выполнена:', e.message || e);
  process.exit(1);
});
