import { NextResponse } from 'next/server';
import { q } from '@/lib/db';
import { parseSessionToken, SESSION_COOKIE } from '@/lib/auth';
import { cookies } from 'next/headers';
import { notifyNewOrder } from '@/bots';

export const dynamic = 'force-dynamic';

async function adminId(): Promise<number | null> {
  const c = await cookies();
  return parseSessionToken(c.get(SESSION_COOKIE)?.value);
}

// GET /api/orders — admin only: list orders
export async function GET() {
  const uid = await adminId();
  if (!uid) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  const r = await q(
    `SELECT o.*, (SELECT COUNT(*)::int FROM order_items i WHERE i.order_id = o.id) AS items_count
     FROM orders o ORDER BY o.created_at DESC LIMIT 500`
  );
  return NextResponse.json(r.rows);
}

// POST /api/orders — public: create order/request
export async function POST(req: Request) {
  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'invalid json' }, { status: 400 });
  }
  const name = String(body?.name ?? '').trim();
  const phone = String(body?.phone ?? '').trim();
  if (!name || !phone) {
    return NextResponse.json({ error: 'name and phone are required' }, { status: 400 });
  }
  if (name.length > 200 || phone.length > 50) {
    return NextResponse.json({ error: 'too long' }, { status: 400 });
  }
  const email = body?.email ? String(body.email).trim().slice(0, 200) : null;
  const company = body?.company ? String(body.company).trim().slice(0, 200) : null;
  const address = body?.address ? String(body.address).trim().slice(0, 500) : null;
  const comment = body?.comment ? String(body.comment).trim().slice(0, 2000) : null;
  const payment = body?.payment ? String(body.payment).slice(0, 40) : null;
  const rawItems: unknown[] = Array.isArray(body?.items) ? (body.items as unknown[]).slice(0, 100) : [];
  const items = rawItems
    .filter((i: any) => i && i.product_name)
    .map((i: any) => ({
      product_id: Number.isFinite(Number(i.product_id)) ? Number(i.product_id) : null,
      product_name: String(i.product_name).slice(0, 300),
      quantity: Math.min(100000, Math.max(1, Number(i.quantity) || 1)),
      price: i.price != null && Number.isFinite(Number(i.price)) ? Number(i.price) : null,
      options: i.options ? String(i.options).slice(0, 500) : null,
    }));

  const year = new Date().getFullYear();
  for (let attempt = 0; attempt < 5; attempt++) {
    const seq = await q('SELECT COUNT(*)::int AS n FROM orders WHERE number LIKE $1', [`KIP-${year}-%`]);
    const number = `KIP-${year}-${String(seq.rows[0].n + 1).padStart(4, '0')}`;
    const priced = items.length > 0 && items.every((i) => i.price != null);
    const total = priced ? items.reduce((s, i) => s + (i.price as number) * i.quantity, 0) : null;
    let res;
    try {
      res = await q(
        `INSERT INTO orders (number, name, phone, email, company, address, comment, payment, status, total)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,'new',$9) RETURNING id`,
        [number, name, phone, email, company, address, comment, payment, total]
      );
    } catch (e: any) {
      if (e?.code === '23505') continue; // unique violation, retry
      throw e;
    }
    const orderId = res.rows[0].id as number;
    for (const it of items) {
      await q(
        `INSERT INTO order_items (order_id, product_id, product_name, quantity, price, options)
         VALUES ($1,$2,$3,$4,$5,$6)`,
        [orderId, it.product_id, it.product_name, it.quantity, it.price, it.options]
      );
    }

    // Send notifications to Telegram and VK asynchronously
    notifyNewOrder({
      id: orderId,
      number,
      name,
      phone,
      email,
      company,
      address,
      comment,
      payment,
      total,
      items,
    }).catch((err) => {
      console.error('[Notification Trigger Error]:', err);
    });

    return NextResponse.json({ id: orderId, number }, { status: 201 });
  }
  return NextResponse.json({ error: 'could not create order number' }, { status: 500 });
}
