'use client';
import Link from 'next/link';
import { useState } from 'react';
import { useCart } from './CartProvider';
import { formatPrice } from './CatalogClient';

export default function CheckoutForm() {
  const { items, total, clear } = useCart();
  const [f, setF] = useState({
    name: '', phone: '', email: '', company: '', address: '', comment: '',
    payment: 'bank_prepay',
  });
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setF((p) => ({ ...p, [k]: e.target.value }));

  if (done) {
    return (
      <div className="cbox" style={{ maxWidth: 640, margin: '0 auto', textAlign: 'center', padding: 46 }}>
        <div style={{ fontSize: 52, marginBottom: 14 }}>✅</div>
        <h2 style={{ fontSize: 26, fontWeight: 800, marginBottom: 10 }}>
          Заказ оформлен
        </h2>
        <p style={{ color: 'var(--muted)', marginBottom: 8 }}>
          Номер заказа: <b style={{ color: 'var(--acc)' }}>{done}</b>
        </p>
        <p style={{ color: 'var(--muted)', marginBottom: 26 }}>
          Мы свяжемся с вами для подтверждения деталей, выставим счёт и согласуем сроки поставки.
        </p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link href="/catalog" className="btn primary">В каталог</Link>
          <Link href="/" className="btn ghost">На главную</Link>
        </div>
      </div>
    );
  }

  if (!items.length) {
    return (
      <div className="empty-state">
        <div className="big">🛒</div>
        <p style={{ fontSize: 17, fontWeight: 600, marginBottom: 22 }}>
          Корзина пуста — добавьте товары из каталога.
        </p>
        <Link href="/catalog" className="btn primary">
          Перейти в каталог →
        </Link>
      </div>
    );
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    if (!f.name.trim() || !f.phone.trim()) {
      setErr('Укажите имя и телефон');
      return;
    }
    if (!f.address.trim()) {
      setErr('Укажите адрес доставки');
      return;
    }
    setSending(true);
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: f.name.trim(),
          phone: f.phone.trim(),
          email: f.email.trim() || null,
          company: f.company.trim() || null,
          address: f.address.trim() || null,
          comment: f.comment.trim() || null,
          payment: f.payment,
          items: items.map((i) => ({
            product_id: i.id,
            product_name: i.name,
            quantity: i.qty,
            price: i.price,
            options: null,
          })),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'error');
      clear();
      setDone(data.number);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (ex) {
      setErr(ex instanceof Error ? ex.message : String(ex));
    } finally {
      setSending(false);
    }
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 24, alignItems: 'start' }}>
      <form className="cbox" onSubmit={submit}>
        <h3 style={{ marginBottom: 18 }}>
          Данные о заказе
        </h3>
        <div className="frow">
          <div className="field">
            <label>Имя <span className="req">*</span></label>
            <input value={f.name} onChange={set('name')} />
          </div>
          <div className="field">
            <label>Телефон <span className="req">*</span></label>
            <input value={f.phone} onChange={set('phone')} />
          </div>
        </div>
        <div className="frow">
          <div className="field">
            <label>E-mail</label>
            <input type="email" value={f.email} onChange={set('email')} />
          </div>
          <div className="field">
            <label>Компания</label>
            <input value={f.company} onChange={set('company')} />
          </div>
        </div>
        <div className="field">
          <label>Адрес доставки <span className="req">*</span></label>
          <textarea rows={2} value={f.address} onChange={set('address')} />
        </div>
        <div className="field">
          <label>Способ оплаты</label>
          <select value={f.payment} onChange={set('payment')}>
            <option value="bank_prepay">Безналичный расчёт — предоплата</option>
            <option value="bank_postpay">Безналичный расчёт — постоплата</option>
            <option value="invoice">По счёту / другие условия</option>
          </select>
        </div>
        <div className="field">
          <label>Комментарий к заказу</label>
          <textarea rows={3} value={f.comment} onChange={set('comment')} />
        </div>
        {err && <div className="alert err">{err}</div>}
        <button className="btn primary" style={{ width: '100%', justifyContent: 'center' }} disabled={sending}>
          {sending ? '…' : <>Подтвердить заказ</>}
        </button>
      </form>
      <div className="totals">
        <h3 style={{ marginBottom: 14 }}>Ваш заказ</h3>
        {items.map((i) => (
          <div className="trow" key={i.id}>
            <span style={{ paddingRight: 10 }}>
              {i.name} <span style={{ color: 'var(--muted2)' }}>× {i.qty}</span>
            </span>
            <span>{i.price != null ? `${formatPrice(i.price * i.qty)} ₽` : '—'}</span>
          </div>
        ))}
        <div className="trow big">
          <span>Итого</span>
          <span>{formatPrice(total)} ₽</span>
        </div>
        <p style={{ fontSize: 12.5, color: 'var(--muted2)', marginTop: 14 }}>
          Нажимая «Подтвердить заказ», вы соглашаетесь на обработку персональных данных.
        </p>
      </div>
    </div>
  );
}
