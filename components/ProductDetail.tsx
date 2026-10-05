'use client';
import BuyBox from './BuyBox';
import type { Product, ProductExtra } from '@/lib/types';

/** Shared "full" view of a product: used in the popup and on the standalone product page. */
export default function ProductDetail({
  product,
  extra,
  compact = false,
}: {
  product: Product;
  extra: ProductExtra;
  compact?: boolean;
}) {
  const p = product as Product & { cat_ru?: string; cat_slug?: string; cat_icon?: string };
  const ownSupply = p.supply_ru?.trim() ? p.supply_ru : null;
  const supply = ownSupply ?? (extra.supply_ru?.trim() ? extra.supply_ru : '');
  const ownFeatures =
    Array.isArray(p.features_ru) ? p.features_ru.filter((x) => x && x.trim()) : [];
  const features = ownFeatures.length ? ownFeatures : extra.features_ru ?? [];
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

        {supply && (
          <div className="notes" style={{ marginTop: 22 }}>
            {supply}
          </div>
        )}

        {features.length > 0 && (
          <div className="feat-list" style={{ marginTop: 22 }}>
            {features.map((t, i) => (
              <div className="feat" key={i}>
                <div className="chk">✓</div>
                <p>{t}</p>
              </div>
            ))}
          </div>
        )}

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
