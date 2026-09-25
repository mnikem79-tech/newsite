import Link from 'next/link';
import { q } from '@/lib/db';
import ProductForm from '../product-form';

export const dynamic = 'force-dynamic';

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [p, cats] = await Promise.all([
    q('SELECT * FROM products WHERE id = $1', [id]),
    q('SELECT * FROM categories ORDER BY position'),
  ]);
  if (!p.rows.length) {
    return (
      <>
        <div className="a-head"><h1>Товар не найден</h1></div>
        <Link href="/admin/products" className="btn ghost sm">← К списку</Link>
      </>
    );
  }
  const product = p.rows[0];
  return (
    <>
      <div className="a-head">
        <div>
          <h1>Товар {product.code}</h1>
          <div className="sub">{product.name_ru}</div>
        </div>
        <Link href="/admin/products" className="btn ghost sm">← К списку</Link>
      </div>
      <ProductForm
        categories={cats.rows}
        initial={{
          id: product.id,
          slug: product.slug,
          code: product.code,
          category_id: product.category_id,
          name_ru: product.name_ru,
          description_ru: product.description_ru,
          price: product.price,
          price_note: product.price_note,
          is_active: product.is_active,
          icon: product.icon,
        }}
      />
    </>
  );
}
