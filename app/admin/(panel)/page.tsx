import Link from 'next/link';
import { q } from '@/lib/db';
import { L } from '@/components/L';
import { ORDER_STAT_LABEL } from '@/lib/order-status';

export const dynamic = 'force-dynamic';

export default async function AdminDashboard() {
  const [counts, stats, recent] = await Promise.all([
    q(`SELECT status, COUNT(*)::int AS n FROM orders GROUP BY status`),
    q(`SELECT COUNT(*)::int AS products, COALESCE(SUM(total),0)::float AS revenue FROM orders WHERE status <> 'canceled'`),
    q(`SELECT o.*, (SELECT COUNT(*)::int FROM order_items i WHERE i.order_id = o.id) AS items_count
       FROM orders o ORDER BY o.created_at DESC LIMIT 8`),
  ]);
  const by = Object.fromEntries(counts.rows.map((r) => [r.status, r.n]));
  const totalOrders = counts.rows.reduce((s, r) => s + r.n, 0);
  const newOrders = by['new'] ?? 0;
  const active = (by['new'] ?? 0) + (by['processing'] ?? 0) + (by['shipped'] ?? 0);
  const revenue = stats.rows[0]?.revenue ?? 0;

  return (
    <>
      <div className="a-head">
        <div>
          <h1><L ru="Дашборд" en="Dashboard" /></h1>
          <div className="sub"><L ru="Сводка по продажам и заявкам" en="Sales & requests overview" /></div>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <Link href="/admin/orders" className="btn ghost sm"><L ru="Все заказы" en="All orders" /></Link>
          <Link href="/admin/products/new" className="btn primary sm">+ <L ru="Товар" en="Product" /></Link>
        </div>
      </div>

      <div className="kpis">
        <div className="kpi">
          <div className="l"><L ru="Заказов всего" en="Total orders" /></div>
          <div className="n">{totalOrders}</div>
        </div>
        <div className="kpi">
          <div className="l"><L ru="Новых" en="New" /></div>
          <div className="n acc">{newOrders}</div>
        </div>
        <div className="kpi">
          <div className="l"><L ru="В работе" en="In progress" /></div>
          <div className="n gold">{active}</div>
        </div>
        <div className="kpi">
          <div className="l"><L ru="Сумма заказов" en="Order revenue" /></div>
          <div className="n green">{new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 0 }).format(revenue)} ₽</div>
        </div>
      </div>

      <div className="a-card" style={{ marginBottom: 20 }}>
        <h3><L ru="Товары в каталоге" en="Products in catalog" /><small>{stats.rows[0]?.products ?? 0} <L ru="позиций" en="items" /></small></h3>
        <div style={{ fontSize: 14.5, color: 'var(--muted)' }}>
          <L
            ru="Позиции каталога, разделы и цены управляются в разделе «Товары». Изменения на сайте применяются в течение ~30 секунд."
            en="Catalog items, sections and prices are managed in the “Products” section. Site changes take effect within ~30 seconds."
          />
        </div>
      </div>

      <div className="a-card">
        <h3><L ru="Последние заказы" en="Recent orders" /></h3>
        <div className="atable-wrap" style={{ border: 0 }}>
          <table className="atable">
            <thead>
              <tr>
                <th>№</th>
                <th><L ru="Клиент" en="Client" /></th>
                <th><L ru="Товары" en="Items" /></th>
                <th><L ru="Сумма" en="Total" /></th>
                <th><L ru="Статус" en="Status" /></th>
                <th><L ru="Дата" en="Date" /></th>
              </tr>
            </thead>
            <tbody>
              {recent.rows.length === 0 && (
                <tr><td colSpan={6} className="muted"><L ru="Заказов пока нет." en="No orders yet." /></td></tr>
              )}
              {recent.rows.map((o) => (
                <tr key={o.id}>
                  <td className="mono"><Link href={`/admin/orders/${o.id}`}>{o.number}</Link></td>
                  <td>
                    {o.name}
                    <div className="muted">{o.phone}{o.company ? ` · ${o.company}` : ''}</div>
                  </td>
                  <td>{o.items_count}</td>
                  <td>{o.total != null ? `${new Intl.NumberFormat('ru-RU').format(Number(o.total))} ₽` : '—'}</td>
                  <td><span className={`st ${o.status}`}>{ORDER_STAT_LABEL[o.status as keyof typeof ORDER_STAT_LABEL]?.ru ?? o.status}</span></td>
                  <td className="muted">{new Date(o.created_at).toLocaleString('ru-RU')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
