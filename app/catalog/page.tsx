import { q } from '@/lib/db';
import { getPageSections } from '@/lib/content';
import { SectionRenderer } from '@/components/SectionRenderer';
import type { Category, Product } from '@/lib/types';

export const dynamic = 'force-dynamic';

export default async function CatalogPage({ searchParams }: { searchParams: Promise<{ cat?: string }> }) {
  const { cat } = await searchParams;
  let categories: Category[] = [];
  let products: Product[] = [];
  try {
    const cr = await q('SELECT * FROM categories ORDER BY position');
    categories = cr.rows;
    const pr = await q(
      `SELECT p.*, c.slug AS cat_slug, c.name_ru AS cat_ru
       FROM products p JOIN categories c ON c.id = p.category_id
       WHERE p.is_active = TRUE ORDER BY c.position, p.position`
    );
    products = pr.rows as unknown as Product[];
  } catch (e) {
    console.error(e);
  }

  const sections = await getPageSections('catalog');

  return (
    <SectionRenderer
      sections={sections}
      catalogCategories={categories}
      catalogProducts={products}
      initialCat={cat ?? 'all'}
    />
  );
}
