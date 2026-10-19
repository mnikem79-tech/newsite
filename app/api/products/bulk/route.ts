import { NextResponse } from 'next/server';
import { q } from '@/lib/db';
import { parseSessionToken, SESSION_COOKIE } from '@/lib/auth';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

async function adminId(): Promise<number | null> {
  const c = await cookies();
  return parseSessionToken(c.get(SESSION_COOKIE)?.value);
}

/* POST /api/products/bulk
   body: { ids: number[], action: 'hide' | 'show' | 'move' | 'delete', category_id?: number }
   Applies one action to several products at once. */
export async function POST(req: Request) {
  const uid = await adminId();
  if (!uid) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  let b: any;
  try {
    b = await req.json();
  } catch {
    return NextResponse.json({ error: 'invalid json' }, { status: 400 });
  }

  const ids: number[] = Array.isArray(b?.ids) ? b.ids.map((v: any) => Number(v)).filter((n: number) => Number.isInteger(n)) : [];
  const action = String(b?.action ?? '');
  if (!ids.length) return NextResponse.json({ error: 'ids required' }, { status: 400 });
  if (ids.length > 500) return NextResponse.json({ error: 'too many ids' }, { status: 400 });

  const ACTIONS = ['hide', 'show', 'move', 'delete'];
  if (!ACTIONS.includes(action)) return NextResponse.json({ error: 'unknown action' }, { status: 400 });

  try {
    if (action === 'hide' || action === 'show') {
      await q('UPDATE products SET is_active = $2, updated_at = now() WHERE id = ANY($1::int[])', [ids, action === 'show']);
    } else if (action === 'move') {
      const category_id = Number(b?.category_id);
      if (!Number.isInteger(category_id)) return NextResponse.json({ error: 'category required' }, { status: 400 });
      await q('UPDATE products SET category_id = $2, updated_at = now() WHERE id = ANY($1::int[])', [ids, category_id]);
    } else {
      await q('DELETE FROM products WHERE id = ANY($1::int[])', [ids]);
    }
    return NextResponse.json({ ok: true, count: ids.length });
  } catch (e) {
    console.error('bulk action failed:', e);
    return NextResponse.json({ error: 'bulk action failed' }, { status: 500 });
  }
}
