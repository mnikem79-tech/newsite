import { NextResponse } from 'next/server';
import { q } from '@/lib/db';
import { parseSessionToken, SESSION_COOKIE } from '@/lib/auth';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

async function adminId(): Promise<number | null> {
  const c = await cookies();
  return parseSessionToken(c.get(SESSION_COOKIE)?.value);
}

// GET /api/categories — list all categories with product counts
export async function GET() {
  try {
    const res = await q(
      `SELECT c.*, COUNT(p.id)::int AS products_count
       FROM categories c
       LEFT JOIN products p ON p.category_id = c.id
       GROUP BY c.id
       ORDER BY c.position, c.id`
    );
    return NextResponse.json(res.rows);
  } catch (err) {
    console.error('Failed to list categories:', err);
    return NextResponse.json({ error: 'DB error' }, { status: 500 });
  }
}

// POST /api/categories — admin: create new category
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
  const name_en = String(b?.name_en ?? '').trim() || name_ru;
  const code = String(b?.code ?? '').trim() || '—';
  const icon = String(b?.icon ?? '⚡').trim().slice(0, 8) || '⚡';
  const note_ru = String(b?.note_ru ?? '').trim();
  const note_en = String(b?.note_en ?? '').trim() || note_ru;

  if (!name_ru) {
    return NextResponse.json({ error: 'Название раздела обязательно' }, { status: 400 });
  }

  // Generate unique slug
  let customSlug = String(b?.slug ?? '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_-]/g, '-');

  if (!customSlug) {
    const base = (code !== '—' ? code : name_ru)
      .toLowerCase()
      .replace(/[./\s]+/g, '-')
      .replace(/[^a-z0-9а-яё_-]/gi, '')
      .slice(0, 40);
    customSlug = `cat-${Date.now().toString().slice(-6)}-${base}`.replace(/^-+|-+$/g, '');
  }

  // Ensure unique slug
  const ex = await q('SELECT id FROM categories WHERE slug = $1', [customSlug]);
  if (ex.rows.length) {
    customSlug = `${customSlug}-${Date.now().toString().slice(-4)}`;
  }

  try {
    const maxPosRes = await q('SELECT COALESCE(MAX(position), 0) + 1 AS next_pos FROM categories');
    const position = Number(b?.position) || maxPosRes.rows[0]?.next_pos || 1;

    const res = await q(
      `INSERT INTO categories (slug, code, name_ru, name_en, note_ru, note_en, icon, position)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [customSlug, code, name_ru, name_en, note_ru, note_en, icon, position]
    );

    return NextResponse.json(res.rows[0], { status: 201 });
  } catch (err) {
    console.error('Failed to create category:', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Ошибка базы данных' },
      { status: 500 }
    );
  }
}
