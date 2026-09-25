'use client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { L } from '@/components/L';
import { ORDER_STATUSES, ORDER_STAT_LABEL } from '@/lib/order-status';

const PAY_LABEL: Record<string, string> = {
  bank_prepay: 'Безналичный расчёт — предоплата',
  bank_postpay: 'Безналичный расчёт — постоплата',
  invoice: 'По счёту / другие условия',
};

export default function OrderDetailClient({
  order,
  items,
}: {
  order: {
    id: number; number: string; name: string; phone: string; email: string | null;
    company: string | null; address: string | null; comment: string | null;
    payment: string | null; status: string; total: number | null;
  };
  items: { product_name: string; quantity: number; price: number | null; options: string | null }[];
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  const changeStatus = async (s: string) => {
    setBusy(true);
    await fetch(`/api/orders/${order.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: s }),
    });
    setBusy(false);
    router.refresh();
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 20, alignItems: 'start' }}>
      <div className="a-card">
        <h3><L ru="Товары заказа" en="Order items" /></h3>
        {items.length === 0 ? (
          <p style={{ color: 'var(--muted)', fontSize: 14.5 }}>
            <L ru="Заявка без товаров (консультация / запрос КП)." en="Request without items (consultation / quotation request)." />
          </p>
        ) : (
          <table className="atable" style={{ marginTop: 6 }}>
            <thead>
              <tr><th><L ru="Наименование" en="Name" /></th><th><L ru="Кол-во" en="Qty" /></th><th><L ru="Цена" en="Price" /></th><th><L ru="Сумма" en="Total" /></th></tr>
            </thead>
            <tbody>
              {items.map((i, idx) => (
                <tr key={idx}>
                  <td>{i.product_name}{i.options && <div className="muted">{i.options}</div>}</td>
                  <td>{i.quantity}</td>
                  <td>{i.price != null ? `${new Intl.NumberFormat('ru-RU').format(i.price)} ₽` : '—'}</td>
                  <td>{i.price != null ? `${new Intl.NumberFormat('ru-RU').format(i.price * i.quantity)} ₽` : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        <div className="trow big" style={{ marginTop: 16 }}>
          <span><L ru="Итого" en="Total" /></span>
          <span>{order.total != null ? `${new Intl.NumberFormat('ru-RU').format(order.total)} ₽` : '—'}</span>
        </div>
      </div>

      <div style={{ display: 'grid', gap: 20 }}>
        <div className="a-card">
          <h3><L ru="Клиент" en="Client" /></h3>
          <div style={{ display: 'grid', gap: 8, fontSize: 14.5 }}>
            <div><b>{order.name}</b></div>
            <div>📞 <a href={`tel:${order.phone}`} style={{ color: 'var(--acc)' }}>{order.phone}</a></div>
            {order.email && <div>✉ <a href={`mailto:${order.email}`} style={{ color: 'var(--acc)' }}>{order.email}</a></div>}
            {order.company && <div>🏢 {order.company}</div>}
            {order.address && <div>📍 {order.address}</div>}
            {order.payment && <div>💳 {PAY_LABEL[order.payment] ?? order.payment}</div>}
            {order.comment && <div style={{ color: 'var(--muted)' }}>📝 {order.comment}</div>}
          </div>
        </div>
        <div className="a-card">
          <h3><L ru="Статус" en="Status" /></h3>
          <div style={{ display: 'grid', gap: 8 }}>
            {ORDER_STATUSES.map((s) => (
              <button
                key={s}
                disabled={busy}
                onClick={() => changeStatus(s)}
                className="mini-btn"
                style={{
                  justifyContent: 'flex-start',
                  padding: '10px 14px',
                  fontSize: 13.5,
                  ...(order.status === s ? { borderColor: 'var(--acc)', color: 'var(--acc)', background: 'rgba(37,195,214,.08)' } : {}),
                }}
              >
                {order.status === s ? '● ' : '○ '}
                {ORDER_STAT_LABEL[s].ru}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
