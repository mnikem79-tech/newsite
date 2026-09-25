'use client';
import Link from 'next/link';
import { useState } from 'react';
import { L, useLang } from './L';
import type { Category, Product } from '@/lib/types';

export function formatPrice(n: number) {
  return new Intl.NumberFormat('ru-RU').format(n);
}

/** Main + secondary name depending on active language. */
export function PairName({ ru, en, cls }: { ru: string; en: string; cls?: string }) {
  const { lang } = useLang();
  return (
    <>
      {lang === 'ru' ? ru : en}
      {cls && <span className={cls}>{lang === 'ru' ? en : ru}</span>}
    </>
  );
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
        <button className={cat === 'all' ? 'on' : ''} onClick={() => setCat('all')}><L ru="Все разделы" en="All sections" /></button>
        {categories.map((c) => (
          <button key={c.id} className={cat === c.slug ? 'on' : ''} onClick={() => setCat(c.slug)}>
            <L ru={c.name_ru} en={c.name_en} />
          </button>
        ))}
      </div>
      {visible.map((c) => (
        <div className="cat-section" key={c.id}>
          <div className="cat-head">
            <div>
              <h3>
                <L ru={c.name_ru} en={c.name_en} />
              </h3>
            </div>
          </div>
          {c.note_ru && <div className="notes"><L ru={c.note_ru} en={c.note_en ?? ''} /></div>}
          <div className="pgrid">
            {products
              .filter((p) => p.category_id === c.id)
              .map((p) => (
                <Link key={p.id} href={`/catalog/${p.slug}`} className="pcard">
                  <div className="ph">
                    <div className="pic">{p.icon}</div>
                    <h3><L ru={p.name_ru} en={p.name_en} /></h3>
                  </div>
                  <p><L ru={p.description_ru} en={p.description_en} /></p>
                  <div className="pfoot">
                    {p.price != null && Number(p.price) > 0 ? (
                      <span className="price">{formatPrice(Number(p.price))} <small>₽</small></span>
                    ) : (
                      <span className="price ask"><L ru="Цена по запросу" en="Price on request" /></span>
                    )}
                    <span style={{ color: 'var(--acc)', fontWeight: 700, fontSize: 13.5 }}>
                      <L ru="Подробнее" en="Details" /> →
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
