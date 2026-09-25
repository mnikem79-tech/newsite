import Link from 'next/link';
import { q } from '@/lib/db';
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
          <h1>Дашборд</h1>
          <div className="sub">Сводка по продажам и заявкам</div>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <Link href="/admin/orders" className="btn ghost sm">Все заказы</Link>
          <Link href="/admin/products/new" className="btn primary sm">+ Товар</Link>
        </div>
      </div>

      <div className="kpis">
        <div className="kpi">
          <div className="l">Заказов всего</div>
          <div className="n">{totalOrders}</div>
        </div>
        <div className="kpi">
          <div className="l">Новых</div>
          <div className="n acc">{newOrders}</div>
        </div>
        <div className="kpi">
          <div className="l">В работе</div>
          <div className="n gold">{active}</div>
        </div>
        <div className="kpi">
          <div className="l">Сумма заказов</div>
          <div className="n green">{new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 0 }).format(revenue)} ₽</div>
        </div>
      </div>

      <div className="a-card" style={{ marginBottom: 20 }}>
        <h3>Товары в каталоге<small>{stats.rows[0]?.products ?? 0} позиций</small></h3>
        <div style={{ fontSize: 14.5, color: 'var(--muted)' }}>
          Позиции каталога, разделы и цены управляются в разделе «Товары». Изменения на сайте применяются в течение ~30 секунд.
        </div>
      </div>

      <div className="a-card">
        <h3>Последние заказы</h3>
        <div className="atable-wrap" style={{ border: 0 }}>
          <table className="atable">
            <thead>
              <tr>
                <th>№</th>
                <th>Клиент</th>
                <th>Товары</th>
                <th>Сумма</th>
                <th>Статус</th>
                <th>Дата</th>
              </tr>
            </thead>
            <tbody>
              {recent.rows.length === 0 && (
                <tr><td colSpan={6} className="muted">Заказов пока нет.</td></tr>
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
