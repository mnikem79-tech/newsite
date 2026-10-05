'use client';
import { useEffect } from 'react';
import ProductDetail from './ProductDetail';
import type { Product, ProductExtra } from '@/lib/types';

/** Popup with the full product description, opened by the «Подробнее» button. */
export default function ProductModal({
  product,
  extra,
  onClose,
}: {
  product: Product;
  extra: ProductExtra;
  onClose: () => void;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  const p = product as Product & { cat_ru?: string };

  return (
    <div
      className="pmodal-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-label={p.name_ru}
    >
      <div className="pmodal">
        <div className="pmodal-head">
          <div>
            <div className="crumb" style={{ marginBottom: 4 }}>
              <a href="/catalog">Каталог</a>
              {p.cat_ru && (
                <>
                  {' / '}
                  <span>{p.cat_ru}</span>
                </>
              )}
            </div>
            <h2 style={{ margin: 0, fontSize: 22 }}>{p.name_ru}</h2>
          </div>
          <button className="mini-btn red" onClick={onClose} aria-label="Закрыть" title="Закрыть (Esc)">
            ✕
          </button>
        </div>
        <div className="pmodal-body">
          <ProductDetail product={product} extra={extra} compact />
        </div>
      </div>
    </div>
  );
}
