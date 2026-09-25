'use client';
import Link from 'next/link';
import { useCart } from './CartProvider';
import { L, useLang } from './L';
import { formatPrice } from './CatalogClient';

export default function CartView() {
  const { items, total, setQty, remove, clear } = useCart();
  const { lang } = useLang();

  if (!items.length) {
    return (
      <div className="empty-state">
        <div className="big">🛒</div>
        <p style={{ fontSize: 17, fontWeight: 600, marginBottom: 6 }}>
          <L ru="Корзина пуста" en="Your cart is empty" />
        </p>
        <p style={{ marginBottom: 22 }}>
          <L
            ru="Добавьте товары из каталога, чтобы оформить заказ."
            en="Add items from the catalog to place an order."
          />
        </p>
        <Link href="/catalog" className="btn primary">
          <L ru="Перейти в каталог" en="Go to catalog" /> →
        </Link>
      </div>
    );
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: 24, alignItems: 'start' }} className="cart-layout">
      <div className="cartbox">
        <div className="crow2 head">
          <span><L ru="Товар" en="Item" /></span>
          <span className="hide-m"><L ru="Кол-во" en="Qty" /></span>
          <span><L ru="Сумма" en="Total" /></span>
          <span className="hide-m"></span>
          <span></span>
        </div>
        {items.map((i) => (
          <div className="crow2" key={i.id}>
            <span>
              <Link href={`/catalog/${i.slug}`} style={{ fontWeight: 700, color: 'var(--txt)' }}>{i.name}</Link>
            </span>
            <span className="hide-m">
              <span className="qty">
                <button type="button" onClick={() => setQty(i.id, i.qty - 1)}>−</button>
                <span>{i.qty}</span>
                <button type="button" onClick={() => setQty(i.id, i.qty + 1)}>+</button>
              </span>
            </span>
            <span style={{ fontWeight: 700 }}>
              {i.price != null ? `${formatPrice(i.price * i.qty)} ₽` : '—'}
            </span>
            <span className="hide-m">
              <button className="rm" type="button" onClick={() => remove(i.id)} title="remove">✕</button>
            </span>
            <span />
          </div>
        ))}
      </div>
      <div className="totals">
        <div className="trow">
          <span><L ru="Товары" en="Items" /></span>
          <span>{items.reduce((s, i) => s + i.qty, 0)}</span>
        </div>
        <div className="trow">
          <span><L ru="Итого" en="Total" /></span>
          <span style={{ fontWeight: 700 }}>{formatPrice(total)} ₽</span>
        </div>
        <div className="trow big">
          <span><L ru="К оплате" en="To pay" /></span>
          <span>{formatPrice(total)} ₽</span>
        </div>
        <div style={{ display: 'grid', gap: 10, marginTop: 18 }}>
          <Link href="/checkout" className="btn primary" style={{ justifyContent: 'center' }}>
            <L ru="Оформить заказ" en="Checkout" /> →
          </Link>
          <button className="btn ghost" style={{ justifyContent: 'center' }} onClick={clear}>
            <L ru="Очистить корзину" en="Clear cart" />
          </button>
        </div>
        <p style={{ fontSize: 12.5, color: 'var(--muted2)', marginTop: 14 }}>
          <L
            ru="Оплата по счёту: безналичный расчёт для юрлиц и ИП. Доставка по России и странам СНГ."
            en="Invoice payment: bank transfer for legal entities and individual entrepreneurs. Delivery across Russia and CIS."
          />
        </p>
      </div>
    </div>
  );
}
