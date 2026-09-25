'use client';
import Link from 'next/link';
import { useState } from 'react';
import type { Category, Product } from '@/lib/types';

export function formatPrice(n: number) {
  return new Intl.NumberFormat('ru-RU').format(n);
}

export default function CatalogClient({
  categories,
  products,
  initialCat,
}: {
  categories: Category[];
  products: Product[];
  initialCat: string;
}) {
  const [cat, setCat] = useState(initialCat);
  const visible = cat === 'all' ? categories : categories.filter((c) => c.slug === cat);

  return (
    <>
      <div className="cat-nav">
        <button className={cat === 'all' ? 'on' : ''} onClick={() => setCat('all')}>Все разделы</button>
        {categories.map((c) => (
          <button key={c.id} className={cat === c.slug ? 'on' : ''} onClick={() => setCat(c.slug)}>
            {c.name_ru}
          </button>
        ))}
      </div>
      {visible.map((c) => (
        <div className="cat-section" key={c.id}>
          <div className="cat-head">
            <div>
              <h3>
                {c.name_ru}
              </h3>
            </div>
          </div>
          {c.note_ru && <div className="notes">{c.note_ru}</div>}
          <div className="pgrid">
            {products
              .filter((p) => p.category_id === c.id)
              .map((p) => (
                <Link key={p.id} href={`/catalog/${p.slug}`} className="pcard">
                  <div className="ph">
                    <div className="pic">{p.icon}</div>
                    <h3>{p.name_ru}</h3>
                  </div>
                  <p>{p.description_ru}</p>
                  <div className="pfoot">
                    {p.price != null && Number(p.price) > 0 ? (
                      <span className="price">{formatPrice(Number(p.price))} <small>₽</small></span>
                    ) : (
                      <span className="price ask">Цена по запросу</span>
                    )}
                    <span style={{ color: 'var(--acc)', fontWeight: 700, fontSize: 13.5 }}>
                      Подробнее →
                    </span>
                  </div>
                </Link>
              ))}
          </div>
        </div>
      ))}
    </>
  );
}
