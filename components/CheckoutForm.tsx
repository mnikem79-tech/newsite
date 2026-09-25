'use client';
import Link from 'next/link';
import { useState } from 'react';
import { useCart } from './CartProvider';
import { L, useLang } from './L';
import { formatPrice } from './CatalogClient';

export default function CheckoutForm() {
  const { items, total, clear } = useCart();
  const { lang } = useLang();
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
          <L ru="Заказ оформлен" en="Order placed" />
        </h2>
        <p style={{ color: 'var(--muted)', marginBottom: 8 }}>
          <L ru="Номер заказа" en="Order number" />: <b style={{ color: 'var(--acc)' }}>{done}</b>
        </p>
        <p style={{ color: 'var(--muted)', marginBottom: 26 }}>
          <L
            ru="Мы свяжемся с вами для подтверждения деталей, выставим счёт и согласуем сроки поставки."
            en="We will contact you to confirm the details, issue an invoice and agree on delivery terms."
          />
        </p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link href="/catalog" className="btn primary"><L ru="В каталог" en="To catalog" /></Link>
          <Link href="/" className="btn ghost"><L ru="На главную" en="Home" /></Link>
        </div>
      </div>
    );
  }

  if (!items.length) {
    return (
      <div className="empty-state">
        <div className="big">🛒</div>
        <p style={{ fontSize: 17, fontWeight: 600, marginBottom: 22 }}>
          <L ru="Корзина пуста — добавьте товары из каталога." en="Your cart is empty — add items from the catalog." />
        </p>
        <Link href="/catalog" className="btn primary">
          <L ru="Перейти в каталог" en="Go to catalog" /> →
        </Link>
      </div>
    );
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    if (!f.name.trim() || !f.phone.trim()) {
      setErr(lang === 'ru' ? 'Укажите имя и телефон' : 'Please provide name and phone');
      return;
    }
    if (!f.address.trim()) {
      setErr(lang === 'ru' ? 'Укажите адрес доставки' : 'Please provide the delivery address');
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
          <L ru="Данные о заказе" en="Order details" />
        </h3>
        <div className="frow">
          <div className="field">
            <label><L ru="Имя" en="Name" /> <span className="req">*</span></label>
            <input value={f.name} onChange={set('name')} />
          </div>
          <div className="field">
            <label><L ru="Телефон" en="Phone" /> <span className="req">*</span></label>
            <input value={f.phone} onChange={set('phone')} />
          </div>
        </div>
        <div className="frow">
          <div className="field">
            <label>E-mail</label>
            <input type="email" value={f.email} onChange={set('email')} />
          </div>
          <div className="field">
            <label><L ru="Компания" en="Company" /></label>
            <input value={f.company} onChange={set('company')} />
          </div>
        </div>
        <div className="field">
          <label><L ru="Адрес доставки" en="Delivery address" /> <span className="req">*</span></label>
          <textarea rows={2} value={f.address} onChange={set('address')} />
        </div>
        <div className="field">
          <label><L ru="Способ оплаты" en="Payment method" /></label>
          <select value={f.payment} onChange={set('payment')}>
            <option value="bank_prepay"><L ru="Безналичный расчёт — предоплата" en="Bank transfer — prepayment" /></option>
            <option value="bank_postpay"><L ru="Безналичный расчёт — постоплата" en="Bank transfer — postpayment" /></option>
            <option value="invoice"><L ru="По счёту / другие условия" en="Per invoice / other terms" /></option>
          </select>
        </div>
        <div className="field">
          <label><L ru="Комментарий к заказу" en="Order comment" /></label>
          <textarea rows={3} value={f.comment} onChange={set('comment')} />
        </div>
        {err && <div className="alert err">{err}</div>}
        <button className="btn primary" style={{ width: '100%', justifyContent: 'center' }} disabled={sending}>
          {sending ? '…' : <><L ru="Подтвердить заказ" en="Confirm order" /></>}
        </button>
      </form>
      <div className="totals">
        <h3 style={{ marginBottom: 14 }}><L ru="Ваш заказ" en="Your order" /></h3>
        {items.map((i) => (
          <div className="trow" key={i.id}>
            <span style={{ paddingRight: 10 }}>
              {i.name} <span style={{ color: 'var(--muted2)' }}>× {i.qty}</span>
            </span>
            <span>{i.price != null ? `${formatPrice(i.price * i.qty)} ₽` : '—'}</span>
          </div>
        ))}
        <div className="trow big">
          <span><L ru="Итого" en="Total" /></span>
          <span>{formatPrice(total)} ₽</span>
        </div>
        <p style={{ fontSize: 12.5, color: 'var(--muted2)', marginTop: 14 }}>
          <L
            ru="Нажимая «Подтвердить заказ», вы соглашаетесь на обработку персональных данных."
            en="By confirming the order you agree to the processing of personal data."
          />
        </p>
      </div>
    </div>
  );
}
