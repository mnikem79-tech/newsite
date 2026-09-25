/**
 * app/api/auth/login/route.ts
 *
 * ИЗМЕНЕНО: логин и пароль берутся из .env.production
 * (ADMIN_EMAIL / ADMIN_PASSWORD). Запрос к таблице users убран —
 * вход работает даже если PostgreSQL недоступен.
 *
 * Добавлено: ограничение числа попыток подбора (8 за 10 минут на IP)
 * и логирование неудачных входов.
 */
import { NextResponse } from 'next/server';
import { createSessionToken, SESSION_COOKIE, verifyEnvAdmin, envAdminConfig, ENV_ADMIN_ID } from '@/lib/auth';

export const dynamic = 'force-dynamic';

/* ------------------------------------------------------------------ */
/* Троттлинг попыток входа (в памяти процесса)                         */
/* ------------------------------------------------------------------ */

const WINDOW_MS = 10 * 60 * 1000;
const MAX_ATTEMPTS = 8;
const attempts = new Map<string, { count: number; resetAt: number }>();

function clientIp(req: Request): string {
  const xff = req.headers.get('x-forwarded-for');
  if (xff) return xff.split(',')[0].trim();
  return req.headers.get('x-real-ip') || 'unknown';
}

function prune(now: number) {
  if (attempts.size < 500) return;
  for (const [k, v] of attempts) if (v.resetAt < now) attempts.delete(k);
}

function throttle(ip: string): { blocked: boolean; retryAfter: number } {
  const now = Date.now();
  prune(now);
  const rec = attempts.get(ip);
  if (!rec) return { blocked: false, retryAfter: 0 };
  if (rec.resetAt < now) {
    attempts.delete(ip);
    return { blocked: false, retryAfter: 0 };
  }
  if (rec.count >= MAX_ATTEMPTS) {
    return { blocked: true, retryAfter: Math.ceil((rec.resetAt - now) / 1000) };
  }
  return { blocked: false, retryAfter: 0 };
}

function registerFailure(ip: string) {
  const now = Date.now();
  const rec = attempts.get(ip);
  if (!rec || rec.resetAt < now) attempts.set(ip, { count: 1, resetAt: now + WINDOW_MS });
  else rec.count += 1;
}

/* ------------------------------------------------------------------ */

export async function POST(req: Request) {
  const cfg = envAdminConfig();

  // Переменные не заданы — вход невозможен вообще. Лучше явная ошибка,
  // чем молчаливый отказ: сразу видно, что забыли заполнить .env.production
  if (!cfg.ready) {
    console.error('[auth] ADMIN_EMAIL / ADMIN_PASSWORD не заданы — вход в админку отключён');
    return NextResponse.json({ error: 'authentication is not configured' }, { status: 503 });
  }

  const ip = clientIp(req);
  const t = throttle(ip);
  if (t.blocked) {
    console.warn(`[auth] блокировка подбора пароля: ${ip} на ${t.retryAfter} с`);
    return NextResponse.json(
      { error: `too many attempts, retry in ${t.retryAfter}s` },
      { status: 429, headers: { 'Retry-After': String(t.retryAfter) } }
    );
  }

  let b: any;
  try {
    b = await req.json();
  } catch {
    return NextResponse.json({ error: 'invalid json' }, { status: 400 });
  }

  const email = String(b?.email ?? '').trim().toLowerCase();
  const password = String(b?.password ?? '');
  if (!email || !password) {
    return NextResponse.json({ error: 'email and password required' }, { status: 400 });
  }

  if (!verifyEnvAdmin(email, password)) {
    registerFailure(ip);
    console.warn(`[auth] неудачный вход: ${email} с ${ip}`);
    return NextResponse.json({ error: 'wrong email or password' }, { status: 401 });
  }

  attempts.delete(ip);
  const token = createSessionToken(ENV_ADMIN_ID);
  const res = NextResponse.json({ ok: true, name: cfg.name });
  res.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 7 * 24 * 3600,
    // Включите (ADMIN_COOKIE_SECURE=true), когда http:// гарантированно
    // редиректит на https:// — тогда cookie не уйдёт по незащищённому соединению.
    secure: (process.env.ADMIN_COOKIE_SECURE || '').toLowerCase() === 'true',
  });
  console.log(`[auth] вход выполнен: ${email} с ${ip}`);
  return res;
}
