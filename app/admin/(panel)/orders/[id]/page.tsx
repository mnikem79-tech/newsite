import Link from 'next/link';
import { q } from '@/lib/db';
import OrderDetailClient from './order-detail-client';

export const dynamic = 'force-dynamic';

export default async function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [o, items] = await Promise.all([
    q('SELECT * FROM orders WHERE id = $1', [id]),
    q('SELECT * FROM order_items WHERE order_id = $1', [id]),
  ]);
  if (!o.rows.length) {
    return (
      <>
        <div className="a-head"><h1>Заказ не найден</h1></div>
        <Link href="/admin/orders" className="btn ghost sm">← К списку</Link>
      </>
    );
  }
  const order = o.rows[0];
  return (
    <>
      <div className="a-head">
        <div>
          <h1>{order.number}</h1>
          <div className="sub">{new Date(order.created_at).toLocaleString('ru-RU')}</div>
        </div>
        <Link href="/admin/orders" className="btn ghost sm">← К списку</Link>
      </div>
      <OrderDetailClient
        order={{
          id: order.id,
          number: order.number,
          name: order.name,
          phone: order.phone,
          email: order.email,
          company: order.company,
          address: order.address,
          comment: order.comment,
          payment: order.payment,
          status: order.status,
          total: order.total == null ? null : Number(order.total),
        }}
        items={items.rows.map((i) => ({
          product_name: i.product_name,
          quantity: i.quantity,
          price: i.price == null ? null : Number(i.price),
          options: i.options,
        }))}
      />
    </>
  );
}
