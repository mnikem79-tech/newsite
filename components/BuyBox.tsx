'use client';
import { useState } from 'react';
import { L, useLang } from './L';
import { useCart } from './CartProvider';
import { formatPrice } from './CatalogClient';

export default function BuyBox({
  product,
}: {
  product: { id: number; slug: string; code: string; name_ru: string; name_en: string; price: number | null; price_note: string | null };
}) {
  const { lang } = useLang();
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
    showToast(lang === 'ru' ? 'Товар добавлен в корзину' : 'Item added to cart');
    setQty(1);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    if (!name.trim() || !phone.trim()) {
      setErr(lang === 'ru' ? 'Укажите имя и телефон' : 'Please provide name and phone');
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
          <div className="price">{formatPrice(product.price)} <small>₽ / <L ru="шт" en="pc" /></small></div>
          {product.price_note && <div className="pnote"><L ru={product.price_note} en={product.price_note} /></div>}
          <div className="actions">
            <div className="qty" style={{ alignSelf: 'center' }}>
              <button type="button" onClick={() => setQty((v) => Math.max(1, v - 1))}>−</button>
              <span>{qty}</span>
              <button type="button" onClick={() => setQty((v) => v + 1)}>+</button>
            </div>
            <button className="btn primary" onClick={toCart}>
              <L ru="В корзину" en="Add to cart" /> 🛒
            </button>
          </div>
        </>
      ) : (
        <>
          <div className="price ask"><L ru="Цена по запросу" en="Price on request" /></div>
          <div className="pnote">
            <L
              ru="Оставьте заявку — подготовим коммерческое предложение с ценой, сроками и условиями поставки."
              en="Send a request — we will prepare a quotation with price, lead time and delivery terms."
            />
          </div>
          <div className="qty-row">
            <span className="qty-label"><L ru="Количество" en="Quantity" /></span>
            <div className="qty">
              <button type="button" onClick={() => setQty((v) => Math.max(1, v - 1))}>−</button>
              <span>{qty}</span>
              <button type="button" onClick={() => setQty((v) => v + 1)}>+</button>
            </div>
          </div>
        </>
      )}

      <form className="ordform" onSubmit={submit}>
        <h3><L ru="Оформить заказ / запрос" en="Place an order / request" /></h3>
        <div className="field">
          <label><L ru="Имя" en="Name" /> <span className="req">*</span></label>
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder={lang === 'ru' ? 'Как к вам обращаться' : 'Your name'} />
        </div>
        <div className="field">
          <label><L ru="Телефон" en="Phone" /> <span className="req">*</span></label>
          <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+7 (___) ___-__-__" />
        </div>
        <div className="field">
          <label><L ru="E-mail" en="E-mail" /></label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@company.ru" />
        </div>
        <div className="field">
          <label><L ru="Комментарий" en="Comment" /></label>
          <textarea value={comment} onChange={(e) => setComment(e.target.value)} rows={3} placeholder={lang === 'ru' ? 'Объект, особые требования…' : 'Site, special requirements…'} />
        </div>
        <button className="btn primary" style={{ width: '100%', justifyContent: 'center' }} disabled={sending}>
          {sending ? '…' : <><L ru="Отправить" en="Send" /></>}
        </button>
        {err && <div className="alert err" style={{ marginTop: 14 }}>{err}</div>}
        {orderNo && (
          <div className="ord-ok">
            <L ru="Заявка" en="Request" /> <b>{orderNo}</b>
            {lang === 'ru'
              ? ' принята. Мы свяжемся с вами в рабочее время.'
              : ' received. We will contact you during business hours.'}
          </div>
        )}
      </form>
    </div>
  );
}
