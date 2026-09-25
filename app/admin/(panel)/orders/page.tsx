import { q } from '@/lib/db';
import OrdersFilter from './orders-filter';

export const dynamic = 'force-dynamic';

export default async function AdminOrders() {
  const r = await q(
    `SELECT o.*, (SELECT COUNT(*)::int FROM order_items i WHERE i.order_id = o.id) AS items_count
     FROM orders o ORDER BY o.created_at DESC LIMIT 500`
  );
  return (
    <>
      <div className="a-head">
        <div>
          <h1>Заказы и заявки</h1>
          <div className="sub">{r.rows.length} записей</div>
        </div>
      </div>
      <OrdersFilter
        orders={r.rows.map((o) => ({
          id: o.id,
          number: o.number,
          name: o.name,
          phone: o.phone,
          company: o.company,
          items_count: o.items_count,
          total: o.total == null ? null : Number(o.total),
          status: o.status,
          created_at: o.created_at,
        }))}
      />
    </>
  );
}
