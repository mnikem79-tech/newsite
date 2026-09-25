import { NextResponse } from 'next/server';
import { q } from '@/lib/db';
import { parseSessionToken, SESSION_COOKIE } from '@/lib/auth';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

async function adminId(): Promise<number | null> {
  const c = await cookies();
  return parseSessionToken(c.get(SESSION_COOKIE)?.value);
}

// PUT /api/categories/:id — admin: update category
export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const uid = await adminId();
  if (!uid) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  let b: any;
  try {
    b = await req.json();
  } catch {
    return NextResponse.json({ error: 'invalid json' }, { status: 400 });
  }

  const name_ru = String(b?.name_ru ?? '').trim();
  const code = String(b?.code ?? '').trim() || '—';
  const icon = String(b?.icon ?? '⚡').trim().slice(0, 8) || '⚡';
  const note_ru = String(b?.note_ru ?? '').trim();
  const position = Number.isFinite(Number(b?.position)) ? Number(b.position) : 0;

  if (!name_ru) {
    return NextResponse.json({ error: 'Название раздела обязательно' }, { status: 400 });
  }

  try {
    const res = await q(
      `UPDATE categories
       SET code = $2, name_ru = $3, note_ru = $4, icon = $5, position = $6
       WHERE id = $1
       RETURNING *`,
      [id, code, name_ru, note_ru, icon, position]
    );

    if (!res.rows.length) {
      return NextResponse.json({ error: 'Раздел не найден' }, { status: 404 });
    }

    return NextResponse.json(res.rows[0]);
  } catch (err) {
    console.error('Failed to update category:', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Ошибка базы данных' },
      { status: 500 }
    );
  }
}

// DELETE /api/categories/:id — admin: delete category
export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const uid = await adminId();
  if (!uid) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  try {
    // Check if category has any products
    const chk = await q('SELECT count(*)::int AS count FROM products WHERE category_id = $1', [id]);
    const count = chk.rows[0]?.count || 0;
    if (count > 0) {
      return NextResponse.json(
        { error: `Нельзя удалить раздел, в котором есть товары (товаров: ${count}). Сначала переместите или удалите товары из этого раздела.` },
        { status: 400 }
      );
    }

    const res = await q('DELETE FROM categories WHERE id = $1 RETURNING id', [id]);
    if (!res.rows.length) {
      return NextResponse.json({ error: 'Раздел не найден' }, { status: 404 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('Failed to delete category:', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Ошибка базы данных' },
      { status: 500 }
    );
  }
}
