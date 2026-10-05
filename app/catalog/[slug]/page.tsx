import Link from 'next/link';
import { notFound } from 'next/navigation';
import { q } from '@/lib/db';
import { getProductExtra } from '@/lib/content';
import ProductDetail from '@/components/ProductDetail';
import type { Product } from '@/lib/types';

export const dynamic = 'force-dynamic';

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  let product: Product | null = null;
  try {
    const r = await q(
      `SELECT p.*, c.slug AS cat_slug, c.name_ru AS cat_ru, c.icon AS cat_icon
       FROM products p JOIN categories c ON c.id = p.category_id
       WHERE p.slug = $1 AND p.is_active = TRUE`,
      [slug]
    );
    if (r.rows.length) product = r.rows[0] as unknown as Product;
  } catch (e) {
    console.error(e);
  }
  if (!product) notFound();

  const extra = await getProductExtra();

  return (
    <>
      <div className="pagehead" style={{ paddingBottom: 20 }}>
        <div className="wrap">
          <div className="crumb">
            <Link href="/">Главная</Link> / <Link href="/catalog">Каталог</Link> /{' '}
            <span>{(product as any).cat_ru as string}</span>
          </div>
        </div>
      </div>
      <section style={{ paddingTop: 26, paddingBottom: 40 }}>
        <div className="wrap">
          <ProductDetail product={product} extra={extra} />
        </div>
      </section>
    </>
  );
}
