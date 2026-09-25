/**
 * lib/auth.ts
 *
 * ИЗМЕНЕНО: вход в админку теперь проверяется по переменным окружения
 * ADMIN_EMAIL / ADMIN_PASSWORD из .env.production. База данных для
 * аутентификации больше не используется.
 *
 * Функции hashPassword / verifyPassword оставлены без изменений —
 * их использует scripts/init-db.js.
 */
import crypto from 'node:crypto';

const secret = () => {
  const s = process.env.SESSION_SECRET;
  if (!s) throw new Error('SESSION_SECRET не задан: добавьте его в .env.production');
  return s;
};

/* ------------------------------------------------------------------ */
/* Хэширование паролей (для scripts/init-db.js) — БЕЗ ИЗМЕНЕНИЙ        */
/* ------------------------------------------------------------------ */

export function hashPassword(pw: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const h = crypto.scryptSync(pw, salt, 64).toString('hex');
  return `scrypt:${salt}:${h}`;
}

export function verifyPassword(pw: string, stored: string): boolean {
  try {
    const [scheme, salt, hash] = stored.split(':');
    if (scheme !== 'scrypt' || !salt || !hash) return false;
    const h = crypto.scryptSync(pw, salt, 64).toString('hex');
    return crypto.timingSafeEqual(Buffer.from(h, 'hex'), Buffer.from(hash, 'hex'));
  } catch {
    return false;
  }
}

/* ------------------------------------------------------------------ */
/* НОВОЕ: учётные данные из .env.production                            */
/* ------------------------------------------------------------------ */

/**
 * id, который попадёт в сессионную cookie.
 * Должен быть НЕ нулём: проверки в API-роутах выглядят как `if (!uid)`,
 * а 0 в JavaScript — falsy, и админку бы не пускало никуда.
 */
export const ENV_ADMIN_ID = Number(process.env.ADMIN_ID || 1) || 1;

/**
 * id сессии для входа через .env (супер-админ сервера).
 * −1 специально: не пересекается с id из таблицы users,
 * поэтому защита «нельзя удалить себя» работает корректно.
 */
export const ENV_SESSION_ID = -1;

/** Сравнение без утечки по времени: хэшируем оба значения до одинаковой длины. */
function safeEqual(a: string, b: string): boolean {
  const ha = crypto.createHash('sha256').update(String(a ?? ''), 'utf8').digest();
  const hb = crypto.createHash('sha256').update(String(b ?? ''), 'utf8').digest();
  return crypto.timingSafeEqual(ha, hb);
}

export type EnvAdminConfig = {
  email: string;
  password: string;
  name: string;
  /** обе переменные заданы — аутентификация возможна */
  ready: boolean;
};

export function envAdminConfig(): EnvAdminConfig {
  const email = (process.env.ADMIN_EMAIL || '').trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD || '';
  return {
    email,
    password,
    name: (process.env.ADMIN_NAME || '').trim() || 'Администратор',
    ready: email.length > 0 && password.length > 0,
  };
}

/** Проверить пару логин/пароль по .env.production. */
export function verifyEnvAdmin(email: string, password: string): boolean {
  const cfg = envAdminConfig();
  if (!cfg.ready) return false;
  // важно: вычисляем оба сравнения, чтобы не выдавать временем, что неверно
  const emailOk = safeEqual((email || '').trim().toLowerCase(), cfg.email);
  const passOk = safeEqual(password || '', cfg.password);
  return emailOk && passOk;
}

/* ------------------------------------------------------------------ */
/* Сессии — БЕЗ ИЗМЕНЕНИЙ                                             */
/* ------------------------------------------------------------------ */

export const SESSION_COOKIE = 'newsite_session';

export function createSessionToken(userId: number): string {
  const exp = Date.now() + 7 * 24 * 3600 * 1000;
  const payload = `${userId}.${exp}`;
  const sig = crypto.createHmac('sha256', secret()).update(payload).digest('hex');
  return `${Buffer.from(payload).toString('base64url')}.${sig}`;
}

export function parseSessionToken(tok: string | undefined | null): number | null {
  if (!tok) return null;
  const [b64, sig] = tok.split('.');
  if (!b64 || !sig) return null;
  const payload = Buffer.from(b64, 'base64url').toString('utf8');
  const expected = crypto.createHmac('sha256', secret()).update(payload).digest('hex');
  if (expected !== sig) return null;
  const [uid, exp] = payload.split('.').map(Number);
  if (!uid || !exp || Date.now() > exp) return null;
  return uid;
}
