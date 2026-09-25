'use client';
import Link from 'next/link';
import { useCart } from './CartProvider';
import { formatPrice } from './CatalogClient';

export default function CartView() {
  const { items, total, setQty, remove, clear } = useCart();

  if (!items.length) {
    return (
      <div className="empty-state">
        <div className="big">🛒</div>
        <p style={{ fontSize: 17, fontWeight: 600, marginBottom: 6 }}>
          Корзина пуста
        </p>
        <p style={{ marginBottom: 22 }}>
          Добавьте товары из каталога, чтобы оформить заказ.
        </p>
        <Link href="/catalog" className="btn primary">
          Перейти в каталог →
        </Link>
      </div>
    );
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: 24, alignItems: 'start' }} className="cart-layout">
      <div className="cartbox">
        <div className="crow2 head">
          <span>Товар</span>
          <span className="hide-m">Кол-во</span>
          <span>Сумма</span>
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
          <span>Товары</span>
          <span>{items.reduce((s, i) => s + i.qty, 0)}</span>
        </div>
        <div className="trow">
          <span>Итого</span>
          <span style={{ fontWeight: 700 }}>{formatPrice(total)} ₽</span>
        </div>
        <div className="trow big">
          <span>К оплате</span>
          <span>{formatPrice(total)} ₽</span>
        </div>
        <div style={{ display: 'grid', gap: 10, marginTop: 18 }}>
          <Link href="/checkout" className="btn primary" style={{ justifyContent: 'center' }}>
            Оформить заказ →
          </Link>
          <button className="btn ghost" style={{ justifyContent: 'center' }} onClick={clear}>
            Очистить корзину
          </button>
        </div>
        <p style={{ fontSize: 12.5, color: 'var(--muted2)', marginTop: 14 }}>
          Оплата по счёту: безналичный расчёт для юрлиц и ИП. Доставка по России и странам СНГ.
        </p>
      </div>
    </div>
  );
}
