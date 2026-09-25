'use client';
import { useState } from 'react';
import { useCart } from './CartProvider';
import { formatPrice } from './CatalogClient';

export default function BuyBox({
  product,
}: {
  product: { id: number; slug: string; code: string; name_ru: string; price: number | null; price_note: string | null };
}) {
  const { add, showToast } = useCart();
  const [qty, setQty] = useState(1);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [comment, setComment] = useState('');
  const [sending, setSending] = useState(false);
  const [orderNo, setOrderNo] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const toCart = () => {
    add({ id: product.id, slug: product.slug, name: product.name_ru, price: product.price }, qty);
    showToast('Товар добавлен в корзину');
    setQty(1);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    if (!name.trim() || !phone.trim()) {
      setErr('Укажите имя и телефон');
      return;
    }
    setSending(true);
    const q = Math.max(1, Math.floor(qty || 1));
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          phone: phone.trim(),
          email: email.trim() || null,
          company: null,
          address: null,
          comment: comment.trim() || null,
          payment: null,
          items: [{ product_id: product.id, product_name: product.name_ru, quantity: q, price: product.price, options: null }],
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'error');
      setOrderNo(data.number);
    } catch (ex) {
      setErr(ex instanceof Error ? ex.message : String(ex));
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="buybox">
      {product.price != null && product.price > 0 ? (
        <>
          <div className="price">{formatPrice(product.price)} <small>₽ / шт</small></div>
          {product.price_note && <div className="pnote">{product.price_note}</div>}
          <div className="actions">
            <div className="qty" style={{ alignSelf: 'center' }}>
              <button type="button" onClick={() => setQty((v) => Math.max(1, v - 1))}>−</button>
              <span>{qty}</span>
              <button type="button" onClick={() => setQty((v) => v + 1)}>+</button>
            </div>
            <button className="btn primary" onClick={toCart}>
              В корзину 🛒
            </button>
          </div>
        </>
      ) : (
        <>
          <div className="price ask">Цена по запросу</div>
          <div className="pnote">
            Оставьте заявку — подготовим коммерческое предложение с ценой, сроками и условиями поставки.
          </div>
          <div className="qty-row">
            <span className="qty-label">Количество</span>
            <div className="qty">
              <button type="button" onClick={() => setQty((v) => Math.max(1, v - 1))}>−</button>
              <span>{qty}</span>
              <button type="button" onClick={() => setQty((v) => v + 1)}>+</button>
            </div>
          </div>
        </>
      )}

      <form className="ordform" onSubmit={submit}>
        <h3>Оформить заказ / запрос</h3>
        <div className="field">
          <label>Имя <span className="req">*</span></label>
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Как к вам обращаться" />
        </div>
        <div className="field">
          <label>Телефон <span className="req">*</span></label>
          <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+7 (___) ___-__-__" />
        </div>
        <div className="field">
          <label>E-mail</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@company.ru" />
        </div>
        <div className="field">
          <label>Комментарий</label>
          <textarea value={comment} onChange={(e) => setComment(e.target.value)} rows={3} placeholder="Объект, особые требования…" />
        </div>
        <button className="btn primary" style={{ width: '100%', justifyContent: 'center' }} disabled={sending}>
          {sending ? '…' : <>Отправить</>}
        </button>
        {err && <div className="alert err" style={{ marginTop: 14 }}>{err}</div>}
        {orderNo && (
          <div className="ord-ok">
            Заявка <b>{orderNo}</b> принята. Мы свяжемся с вами в рабочее время.
          </div>
        )}
      </form>
    </div>
  );
}
