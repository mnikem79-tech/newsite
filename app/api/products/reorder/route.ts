import { NextResponse } from 'next/server';
import { q } from '@/lib/db';
import { parseSessionToken, SESSION_COOKIE } from '@/lib/auth';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

async function adminId(): Promise<number | null> {
  const c = await cookies();
  return parseSessionToken(c.get(SESSION_COOKIE)?.value);
}

/* POST /api/products/reorder
   body: { category_id: number, ids: number[] }
   `ids` is the full list of that category's products in the desired order.
   Positions are rewritten as 1..N for the category; other categories are untouched. */
export async function POST(req: Request) {
  const uid = await adminId();
  if (!uid) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  let b: any;
  try {
    b = await req.json();
  } catch {
    return NextResponse.json({ error: 'invalid json' }, { status: 400 });
  }

  const category_id = Number(b?.category_id);
  const ids: number[] = Array.isArray(b?.ids) ? b.ids.map((v: any) => Number(v)) : [];
  if (!Number.isInteger(category_id)) return NextResponse.json({ error: 'category required' }, { status: 400 });
  if (!ids.length) return NextResponse.json({ error: 'ids required' }, { status: 400 });
  if (new Set(ids).size !== ids.length) return NextResponse.json({ error: 'duplicate ids' }, { status: 400 });

  // every id must belong to the category, otherwise ordering could mix categories
  const chk = await q('SELECT id FROM products WHERE category_id = $1', [category_id]);
  const owned = new Set(chk.rows.map((r: any) => Number(r.id)));
  if (ids.some((id) => !owned.has(id))) {
    return NextResponse.json({ error: 'product does not belong to category' }, { status: 400 });
  }

  // 1..N, then move the whole block far away so it never collides with another category
  const base = (await q('SELECT COALESCE(MAX(position),0)::int AS m FROM products')).rows[0].m as number;
  await Promise.all(
    ids.map((id, idx) =>
      q('UPDATE products SET position = $2, updated_at = now() WHERE id = $1', [id, base + 1 + idx])
    )
  );
  await Promise.all(
    ids.map((id, idx) => q('UPDATE products SET position = $2 WHERE id = $1', [id, idx + 1]))
  );

  return NextResponse.json({ ok: true, count: ids.length });
}
