import { NextResponse } from 'next/server';
import { q } from '@/lib/db';
import { parseSessionToken, SESSION_COOKIE } from '@/lib/auth';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

async function adminId(): Promise<number | null> {
  const c = await cookies();
  return parseSessionToken(c.get(SESSION_COOKIE)?.value);
}

// GET /api/products — public list
export async function GET() {
  const r = await q(
    `SELECT p.*, c.slug AS cat_slug, c.name_ru AS cat_ru
     FROM products p JOIN categories c ON c.id = p.category_id
     WHERE p.is_active = TRUE ORDER BY c.position, p.position`
  );
  return NextResponse.json(r.rows);
}

// POST /api/products — admin: create
export async function POST(req: Request) {
  const uid = await adminId();
  if (!uid) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  let b: any;
  try {
    b = await req.json();
  } catch {
    return NextResponse.json({ error: 'invalid json' }, { status: 400 });
  }
  const name_ru = String(b?.name_ru ?? '').trim();
  const category_id = Number(b?.category_id);
  if (!name_ru) return NextResponse.json({ error: 'name required' }, { status: 400 });
  if (!Number.isInteger(category_id)) return NextResponse.json({ error: 'category required' }, { status: 400 });

  const code = String(b?.code ?? '').trim() || '—';
  const slugBase = name_ru.toLowerCase().replace(/[^a-zа-яё0-9]+/gi, '-').replace(/^-+|-+$/g, '').slice(0, 60) || 'product';
  let slug = `${slugBase}-${code.replace(/[./\s]+/g, '-')}`.replace(/^-+|-+$/g, '').slice(0, 70);

  const res = await q(
    `INSERT INTO products (slug, category_id, code, name_ru, description_ru, price, price_note, is_active, icon, position)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9, (SELECT COALESCE(MAX(position),0)+1 FROM products))
     RETURNING id, slug`,
    [
      slug, category_id, code,
      name_ru,
      String(b?.description_ru ?? ''),
      b?.price != null && b?.price !== '' ? Number(b.price) : null,
      b?.price_note ? String(b.price_note).slice(0, 200) : null,
      b?.is_active !== false,
      String(b?.icon ?? '⚡').slice(0, 8) || '⚡',
    ]
  );
  return NextResponse.json(res.rows[0], { status: 201 });
}
