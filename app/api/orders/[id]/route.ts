import { NextResponse } from 'next/server';
import { q } from '@/lib/db';
import { parseSessionToken, SESSION_COOKIE } from '@/lib/auth';
import { cookies } from 'next/headers';
import type { OrderStatus } from '@/lib/types';

export const dynamic = 'force-dynamic';

const STATUSES: OrderStatus[] = ['new', 'processing', 'shipped', 'done', 'canceled'];

async function adminId(): Promise<number | null> {
  const c = await cookies();
  return parseSessionToken(c.get(SESSION_COOKIE)?.value);
}

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const uid = await adminId();
  if (!uid) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  const r = await q('SELECT * FROM orders WHERE id = $1', [id]);
  if (!r.rows.length) return NextResponse.json({ error: 'not found' }, { status: 404 });
  const it = await q('SELECT * FROM order_items WHERE order_id = $1', [id]);
  return NextResponse.json({ ...r.rows[0], items: it.rows });
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const uid = await adminId();
  if (!uid) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'invalid json' }, { status: 400 });
  }
  const status = body?.status;
  if (!STATUSES.includes(status)) {
    return NextResponse.json({ error: 'invalid status' }, { status: 400 });
  }
  const r = await q(
    `UPDATE orders SET status = $2, updated_at = now() WHERE id = $1 RETURNING id, status`,
    [id, status]
  );
  if (!r.rows.length) return NextResponse.json({ error: 'not found' }, { status: 404 });
  return NextResponse.json(r.rows[0]);
}
