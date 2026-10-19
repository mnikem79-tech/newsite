import Link from 'next/link';
import { q } from '@/lib/db';
import { ORDER_STAT_LABEL } from '@/lib/order-status';

export const dynamic = 'force-dynamic';

export default async function AdminDashboard() {
  const [counts, stats, recent, daily] = await Promise.all([
    q(`SELECT status, COUNT(*)::int AS n FROM orders GROUP BY status`),
    q(`SELECT COUNT(*)::int AS products, COALESCE(SUM(total),0)::float AS revenue FROM orders WHERE status <> 'canceled'`),
    q(`SELECT o.*, (SELECT COUNT(*)::int FROM order_items i WHERE i.order_id = o.id) AS items_count
       FROM orders o ORDER BY o.created_at DESC LIMIT 8`),
    q(`SELECT DATE(created_at) AS d, COUNT(*)::int AS n, COALESCE(SUM(total),0)::float AS s
       FROM orders
       WHERE created_at >= (CURRENT_DATE - interval '30 days')
         AND status <> 'canceled'
       GROUP BY DATE(created_at)
       ORDER BY d`),
  ]);
  const by = Object.fromEntries(counts.rows.map((r) => [r.status, r.n]));
  const totalOrders = counts.rows.reduce((s, r) => s + r.n, 0);
  const newOrders = by['new'] ?? 0;
  const active = (by['new'] ?? 0) + (by['processing'] ?? 0) + (by['shipped'] ?? 0);
  const revenue = stats.rows[0]?.revenue ?? 0;

  const fmtMoney = (v: number) =>
    new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 0 }).format(Math.round(v));

  // Данные по дням за последние 30 дней (пустые дни — нулями)
  const dailyMap = new Map<string, { n: number; s: number }>();
  for (const r of daily.rows) {
    const key = new Date(r.d).toISOString().slice(0, 10);
    dailyMap.set(key, { n: r.n, s: Number(r.s) });
  }
  const days: { date: string; label: string; count: number; sum: number }[] = [];
  const now = new Date();
  for (let i = 29; i >= 0; i--) {
    const dt = new Date(now);
    dt.setDate(dt.getDate() - i);
    const key = dt.toISOString().slice(0, 10);
    const v = dailyMap.get(key) ?? { n: 0, s: 0 };
    days.push({
      date: key,
      label: dt.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit' }),
      count: v.n,
      sum: v.s,
    });
  }
  const maxDay = days.reduce((m, d) => Math.max(m, d.count), 0);
  const iso = (d: Date) => d.toISOString().slice(0, 10);
  const today = days.find((d) => d.date === iso(now));
  const todayCount = today?.count ?? 0;
  const todaySum = today?.sum ?? 0;
  const week = days.slice(-7);
  const weekCount = week.reduce((s2, d) => s2 + d.count, 0);
  const weekSum = week.reduce((s2, d) => s2 + d.sum, 0);
  const monthCount = days.reduce((s2, d) => s2 + d.count, 0);
  const monthSum = days.reduce((s2, d) => s2 + d.sum, 0);
  const avgCount = weekCount;
  const avgSum = weekSum;

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

      <div className="kpis" style={{ marginTop: 14 }}>
        <div className="kpi">
          <div className="l">За сегодня</div>
          <div className="n">{todayCount} <small style={{ fontSize: 14, color: 'var(--muted2)' }}>на {fmtMoney(todaySum)} ₽</small></div>
        </div>
        <div className="kpi">
          <div className="l">За 7 дней</div>
          <div className="n">{weekCount} <small style={{ fontSize: 14, color: 'var(--muted2)' }}>на {fmtMoney(weekSum)} ₽</small></div>
        </div>
        <div className="kpi">
          <div className="l">За 30 дней</div>
          <div className="n">{monthCount} <small style={{ fontSize: 14, color: 'var(--muted2)' }}>на {fmtMoney(monthSum)} ₽</small></div>
        </div>
        <div className="kpi">
          <div className="l">Средний заказ</div>
          <div className="n">{avgCount > 0 ? `${fmtMoney(avgSum / avgCount)} ₽` : '—'}</div>
        </div>
      </div>

      <div className="a-card" style={{ marginBottom: 20 }}>
        <h3>Заказы за последние 30 дней<small>по дням</small></h3>
        {maxDay > 0 ? (
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4, height: 130, paddingTop: 10 }}>
            {days.map((d) => (
              <div
                key={d.date}
                title={`${d.label}: ${d.count} зак. · ${fmtMoney(d.sum)} ₽`}
                style={{
                  flex: 1,
                  minWidth: 0,
                  height: d.count > 0 ? `${Math.max(6, (d.count / maxDay) * 100)}%` : '2px',
                  background: d.count > 0 ? 'var(--acc)' : 'var(--line)',
                  borderRadius: '4px 4px 0 0',
                  opacity: d.count > 0 ? 0.85 : 1,
                }}
              />
            ))}
          </div>
        ) : (
          <div style={{ fontSize: 14.5, color: 'var(--muted)' }}>За последние 30 дней заказов не было.</div>
        )}
        {maxDay > 0 && (
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, fontSize: 11.5, color: 'var(--muted2)' }}>
            <span>{days[0]?.label}</span>
            <span>сегодня</span>
          </div>
        )}
      </div>

      <div className="a-card" style={{ marginBottom: 20 }}>
        <h3>Товары в каталоге<small>{stats.rows[0]?.products ?? 0} позиций</small></h3>
        <div style={{ fontSize: 14.5, color: 'var(--muted)' }}>
          Позиции каталога, разделы и цены управляются в разделе «Товары». Изменения на сайте применяются в течение ~30 секунд.
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
