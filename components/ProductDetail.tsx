'use client';
import BuyBox from './BuyBox';
import type { Product } from '@/lib/types';

/** Shared "full" view of a product: used in the popup and on the standalone product page. */
export default function ProductDetail({
  product,
  compact = false,
}: {
  product: Product;
  compact?: boolean;
}) {
  const p = product as Product & { cat_ru?: string; cat_slug?: string; cat_icon?: string };
  const detail = p.detail_html?.trim() ? p.detail_html : '';

  return (
    <div className="prod-layout">
      <div className="prod-main">
        {!compact && (
          <div className="ph2">
            <div className="pic">{p.icon}</div>
            <div>
              {p.cat_ru && (
                <div className="code2">
                  {p.cat_slug ? (
                    <a href={`/catalog?cat=${p.cat_slug}`} style={{ color: 'var(--muted2)' }}>
                      {p.cat_ru}
                    </a>
                  ) : (
                    p.cat_ru
                  )}
                </div>
              )}
              <h1>{p.name_ru}</h1>
              {p.code && <div className="code2">Код: {p.code}</div>}
            </div>
          </div>
        )}

        {p.description_ru && <div className="desc">{p.description_ru}</div>}

        {detail && (
          <div
            className="prod-detail-html"
            style={{ marginTop: 24 }}
            dangerouslySetInnerHTML={{ __html: detail }}
          />
        )}
      </div>
      <BuyBox
        product={{
          id: p.id,
          slug: p.slug,
          code: p.code,
          name_ru: p.name_ru,
          price: p.price == null ? null : Number(p.price),
          price_note: p.price_note,
        }}
      />
    </div>
  );
}
