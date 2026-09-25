import { NextResponse } from 'next/server';
import { q } from '@/lib/db';
import { hashPassword, parseSessionToken, SESSION_COOKIE } from '@/lib/auth';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

async function adminId(): Promise<number | null> {
  const c = await cookies();
  return parseSessionToken(c.get(SESSION_COOKIE)?.value);
}

// PATCH /api/users/:id — admin: rename / change password
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const uid = await adminId();
  if (!uid) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  const numId = Number(id);
  if (!Number.isInteger(numId)) return NextResponse.json({ error: 'bad id' }, { status: 400 });

  let b: any;
  try {
    b = await req.json();
  } catch {
    return NextResponse.json({ error: 'invalid json' }, { status: 400 });
  }
  const hasName = b?.display_name !== undefined;
  const hasPass = b?.password !== undefined && String(b.password) !== '';
  if (!hasName && !hasPass) return NextResponse.json({ error: 'нечего менять' }, { status: 400 });

  const display_name = hasName ? String(b.display_name ?? '').trim() || null : undefined;
  let password_hash: string | undefined;
  if (hasPass) {
    if (String(b.password).length < 8) {
      return NextResponse.json({ error: 'Пароль: минимум 8 символов' }, { status: 400 });
    }
    password_hash = hashPassword(String(b.password));
  }

  const r = await q(
    `UPDATE users
     SET display_name = COALESCE($2, display_name),
         password_hash = COALESCE($3, password_hash)
     WHERE id = $1
     RETURNING id, email, display_name, role, created_at`,
    [numId, display_name ?? null, password_hash ?? null]
  );
  if (!r.rows.length) return NextResponse.json({ error: 'not found' }, { status: 404 });
  return NextResponse.json(r.rows[0]);
}

// DELETE /api/users/:id — admin (cannot delete self)
export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const uid = await adminId();
  if (!uid) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  const numId = Number(id);
  if (!Number.isInteger(numId)) return NextResponse.json({ error: 'bad id' }, { status: 400 });
  if (numId === uid) return NextResponse.json({ error: 'Нельзя удалить себя' }, { status: 400 });

  const r = await q('DELETE FROM users WHERE id = $1 RETURNING id', [numId]);
  if (!r.rows.length) return NextResponse.json({ error: 'not found' }, { status: 404 });
  return NextResponse.json({ ok: true });
}
