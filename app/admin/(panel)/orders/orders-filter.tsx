'use client';
import Link from 'next/link';
import { useState } from 'react';
import { ORDER_STATUSES, ORDER_STAT_LABEL } from '@/lib/order-status';

interface Row {
  id: number;
  number: string;
  name: string;
  phone: string;
  company: string | null;
  items_count: number;
  total: number | null;
  status: string;
  created_at: string;
}

/** CSV field: wrap in quotes and double any inner quotes. */
function csvCell(v: string | number | null | undefined): string {
  const s = v == null ? '' : String(v);
  return `"${s.replace(/"/g, '""')}"`;
}

export default function OrdersFilter({ orders }: { orders: Row[] }) {
  const [status, setStatus] = useState<string>('all');
  const visible = status === 'all' ? orders : orders.filter((o) => o.status === status);
  const counts = (s: string) => orders.filter((o) => o.status === s).length;

  // Выгрузка в CSV — открывается в Excel и Google Таблицах
  const exportCsv = () => {
    const header = ['Номер', 'Клиент', 'Компания', 'Телефон', 'Товаров', 'Сумма', 'Статус', 'Дата'];
    const lines = [header.map(csvCell).join(';')];
    for (const o of visible) {
      lines.push(
        [
          csvCell(o.number),
          csvCell(o.name),
          csvCell(o.company),
          csvCell(o.phone),
          csvCell(o.items_count),
          csvCell(o.total != null ? o.total.toFixed(2).replace('.', ',') : ''),
          csvCell(ORDER_STAT_LABEL[o.status as keyof typeof ORDER_STAT_LABEL]?.ru ?? o.status),
          csvCell(new Date(o.created_at).toLocaleString('ru-RU')),
        ].join(';')
      );
    }
    // BOM нужен, чтобы Excel правильно открыл кириллицу
    const blob = new Blob(['\uFEFF' + lines.join('\r\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const stamp = new Date().toISOString().slice(0, 10);
    a.href = url;
    a.download = `zakazy-${stamp}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <div className="a-tabs">
        <button className={status === 'all' ? 'on' : ''} onClick={() => setStatus('all')}>
          Все ({orders.length})
        </button>
        {ORDER_STATUSES.map((s) => (
          <button key={s} className={status === s ? 'on' : ''} onClick={() => setStatus(s)}>
            {ORDER_STAT_LABEL[s].ru} ({counts(s)})
          </button>
        ))}
        <button
          className="mini-btn"
          style={{ marginLeft: 'auto' }}
          onClick={exportCsv}
          disabled={visible.length === 0}
          title="Скачать таблицу заказов — откроется в Excel"
        >
          ⤓ Выгрузить в Excel ({visible.length})
        </button>
      </div>
      <div className="atable-wrap">
        <table className="atable">
          <thead>
            <tr>
              <th>№</th>
              <th>Клиент</th>
              <th>Телефон</th>
              <th>Товары</th>
              <th>Сумма</th>
              <th>Статус</th>
              <th>Дата</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {visible.length === 0 && (
              <tr><td colSpan={8} className="muted">Нет заказов с таким статусом.</td></tr>
            )}
            {visible.map((o) => (
              <tr key={o.id} className="clickable" onClick={() => (window.location.href = `/admin/orders/${o.id}`)}>
                <td className="mono">{o.number}</td>
                <td>
                  {o.name}
                  {o.company && <div className="muted">{o.company}</div>}
                </td>
                <td>{o.phone}</td>
                <td>{o.items_count}</td>
                <td>{o.total != null ? `${new Intl.NumberFormat('ru-RU').format(o.total)} ₽` : '—'}</td>
                <td><span className={`st ${o.status}`}>{ORDER_STAT_LABEL[o.status as keyof typeof ORDER_STAT_LABEL]?.ru ?? o.status}</span></td>
                <td className="muted">{new Date(o.created_at).toLocaleString('ru-RU')}</td>
                <td>
                  <Link href={`/admin/orders/${o.id}`} className="mini-btn" onClick={(e) => e.stopPropagation()}>
                    Открыть
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
