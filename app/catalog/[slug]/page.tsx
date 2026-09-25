import Link from 'next/link';
import { notFound } from 'next/navigation';
import { q } from '@/lib/db';
import { L } from '@/components/L';
import BuyBox from '@/components/BuyBox';
import type { Product } from '@/lib/types';

export const dynamic = 'force-dynamic';

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  let product: Product | null = null;
  try {
    const r = await q(
      `SELECT p.*, c.slug AS cat_slug, c.name_ru AS cat_ru, c.name_en AS cat_en, c.icon AS cat_icon
       FROM products p JOIN categories c ON c.id = p.category_id
       WHERE p.slug = $1 AND p.is_active = TRUE`,
      [slug]
    );
    if (r.rows.length) product = r.rows[0] as unknown as Product;
  } catch (e) {
    console.error(e);
  }
  if (!product) notFound();

  const p = product as Product;
  return (
    <>
      <div className="pagehead" style={{ paddingBottom: 20 }}>
        <div className="wrap">
          <div className="crumb">
            <Link href="/">Главная</Link> / <Link href="/catalog">Каталог</Link> / <span><L ru={(p as any).cat_ru as string} en={(p as any).cat_en as string} /></span>
          </div>
        </div>
      </div>
      <section style={{ paddingTop: 26, paddingBottom: 40 }}>
        <div className="wrap">
          <div className="prod-layout">
            <div className="prod-main">
              <div className="ph2">
                <div className="pic">{p.icon}</div>
                <div>
                  <div className="code2">
                    <Link href="/catalog" style={{ color: 'var(--muted2)' }}><L ru={(p as any).cat_ru as string} en={(p as any).cat_en as string} /></Link>
                  </div>
                  <h1>
                    <L ru={p.name_ru} en={p.name_en} />
                  </h1>
                </div>
              </div>
              <div className="desc"><L ru={p.description_ru} en={p.description_en} /></div>
              <div className="notes" style={{ marginTop: 22 }}>
                <b><L ru="Поставка" en="Supply" /></b>{' '}
                <L
                  ru="Поставка по всей России и странам СНГ. Оборудование сопровождается полным пакетом разрешительной документации, сертификатами и декларациями о соответствии."
                  en="Delivery across Russia and CIS. Equipment is supplied with a complete package of permits, certificates and declarations of conformity."
                />
              </div>
              <div className="feat-list" style={{ marginTop: 22 }}>
                <div className="feat"><div className="chk">✓</div><p><L ru="Работа по ГОСТ и ТР, полная документация" en="Compliance with GOST and TR, full documentation" /></p></div>
                <div className="feat"><div className="chk">✓</div><p><L ru="Возможна разработка по требованиям заказчика" en="Custom development to customer specifications" /></p></div>
                <div className="feat"><div className="chk">✓</div><p><L ru="Инженерное сопровождение: расчёты, пусконаладка" en="Engineering support: calculations, commissioning" /></p></div>
              </div>
            </div>
            <BuyBox
              product={{
                id: p.id,
                slug: p.slug,
                code: p.code,
                name_ru: p.name_ru,
                name_en: p.name_en,
                price: p.price == null ? null : Number(p.price),
                price_note: p.price_note,
              }}
            />
          </div>
        </div>
      </section>
    </>
  );
}
