import { NextResponse } from 'next/server';
import { q } from '@/lib/db';
import { parseSessionToken, SESSION_COOKIE } from '@/lib/auth';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

async function adminId(): Promise<number | null> {
  const c = await cookies();
  return parseSessionToken(c.get(SESSION_COOKIE)?.value);
}

async function readFields(b: any) {
  return {
    name_ru: String(b?.name_ru ?? '').trim(),
    code: String(b?.code ?? '').trim(),
    category_id: Number(b?.category_id),
    description_ru: String(b?.description_ru ?? ''),
    price: b?.price != null && b?.price !== '' && Number.isFinite(Number(b.price)) ? Number(b.price) : null,
    price_note: b?.price_note ? String(b.price_note).slice(0, 200) : null,
    is_active: b?.is_active !== false,
    icon: String(b?.icon ?? '⚡').slice(0, 8) || '⚡',
  };
}

// PUT /api/products/:id — admin: update
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
  const f = await readFields(b);
  if (!f.name_ru) return NextResponse.json({ error: 'name required' }, { status: 400 });
  if (!Number.isInteger(f.category_id)) return NextResponse.json({ error: 'category required' }, { status: 400 });
  const r = await q(
    `UPDATE products SET name_ru=$2, code=$3, category_id=$4, description_ru=$5,
     price=$6, price_note=$7, is_active=$8, icon=$9, updated_at=now()
     WHERE id=$1 RETURNING id`,
    [id, f.name_ru, f.code, f.category_id, f.description_ru, f.price, f.price_note, f.is_active, f.icon]
  );
  if (!r.rows.length) return NextResponse.json({ error: 'not found' }, { status: 404 });
  return NextResponse.json(r.rows[0]);
}

// DELETE /api/products/:id — admin
export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const uid = await adminId();
  if (!uid) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  const r = await q('DELETE FROM products WHERE id = $1 RETURNING id', [id]);
  if (!r.rows.length) return NextResponse.json({ error: 'not found' }, { status: 404 });
  return NextResponse.json({ ok: true });
}
