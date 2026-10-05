import { NextResponse } from 'next/server';
import { q, invalidatePages } from '@/lib/db';
import { parseSessionToken, SESSION_COOKIE } from '@/lib/auth';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

async function adminId(): Promise<number | null> {
  const c = await cookies();
  return parseSessionToken(c.get(SESSION_COOKIE)?.value);
}

// PUT /api/pages/:id — admin: update
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
  const title = String(b?.title_ru ?? '').trim();
  if (!title) return NextResponse.json({ error: 'title required' }, { status: 400 });

  const cur = await q('SELECT slug FROM pages WHERE id = $1', [id]);
  if (!cur.rows.length) return NextResponse.json({ error: 'not found' }, { status: 404 });
  const oldSlug = cur.rows[0].slug as string;

  const r = await q(
    `UPDATE pages SET title_ru=$2, is_active=$3, in_menu=$4, position=$5, updated_at=now()
     WHERE id=$1 RETURNING id, slug`,
    [
      id,
      title,
      b?.is_active !== false,
      b?.in_menu !== false,
      Number.isFinite(Number(b?.position)) ? Number(b.position) : 0,
    ]
  );
  if (!r.rows.length) return NextResponse.json({ error: 'not found' }, { status: 404 });
  invalidatePages();
  return NextResponse.json(r.rows[0]);
}

// DELETE /api/pages/:id — admin
export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const uid = await adminId();
  if (!uid) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const cur = await q('SELECT slug, is_system FROM pages WHERE id = $1', [id]);
  if (!cur.rows.length) return NextResponse.json({ error: 'not found' }, { status: 404 });
  if (cur.rows[0].is_system) {
    return NextResponse.json({ error: 'Системную страницу нельзя удалить' }, { status: 400 });
  }
  const slug = cur.rows[0].slug as string;

  // содержимое страницы тоже удаляем, чтобы не копился мусор
  await q('DELETE FROM page_content WHERE key = $1', [`sections_${slug}`]);
  await q('DELETE FROM pages WHERE id = $1', [id]);
  invalidatePages();
  return NextResponse.json({ ok: true, slug });
}
