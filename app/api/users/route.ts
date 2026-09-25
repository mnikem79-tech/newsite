import { NextResponse } from 'next/server';
import { q } from '@/lib/db';
import { hashPassword, parseSessionToken, SESSION_COOKIE } from '@/lib/auth';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

async function adminId(): Promise<number | null> {
  const c = await cookies();
  return parseSessionToken(c.get(SESSION_COOKIE)?.value);
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// GET /api/users — admin: list (without password hashes)
export async function GET() {
  const uid = await adminId();
  if (!uid) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  const r = await q('SELECT id, email, display_name, role, created_at FROM users ORDER BY id');
  return NextResponse.json({ me: uid, users: r.rows });
}

// POST /api/users — admin: create
export async function POST(req: Request) {
  const uid = await adminId();
  if (!uid) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  let b: any;
  try {
    b = await req.json();
  } catch {
    return NextResponse.json({ error: 'invalid json' }, { status: 400 });
  }
  const email = String(b?.email ?? '').trim().toLowerCase();
  const password = String(b?.password ?? '');
  const display_name = String(b?.display_name ?? '').trim() || null;
  if (!EMAIL_RE.test(email)) return NextResponse.json({ error: 'Некорректный email' }, { status: 400 });
  if (password.length < 8) return NextResponse.json({ error: 'Пароль: минимум 8 символов' }, { status: 400 });

  const ex = await q('SELECT id FROM users WHERE lower(email) = lower($1)', [email]);
  if (ex.rows.length) return NextResponse.json({ error: 'Такой email уже есть' }, { status: 409 });

  const ins = await q(
    `INSERT INTO users (email, password_hash, display_name, role)
     VALUES ($1, $2, $3, 'admin')
     RETURNING id, email, display_name, role, created_at`,
    [email, hashPassword(password), display_name]
  );
  return NextResponse.json(ins.rows[0], { status: 201 });
}
