import { q } from '@/lib/db';
import ProductsView, { ProductItem, CategoryItem } from './products-view';

export const dynamic = 'force-dynamic';

export default async function AdminProducts() {
  const [pr, cr] = await Promise.all([
    q(
      `SELECT p.*, c.name_ru AS cat_ru, c.code AS cat_code
       FROM products p JOIN categories c ON c.id = p.category_id
       ORDER BY c.position, p.position`
    ),
    q(
      `SELECT c.*, COUNT(p.id)::int AS products_count
       FROM categories c
       LEFT JOIN products p ON p.category_id = c.id
       GROUP BY c.id
       ORDER BY c.position, c.id`
    ),
  ]);

  return (
    <>
      <div className="a-head">
        <div>
          <h1>Управление товарами и разделами каталога</h1>
          <div className="sub">
            Редактирование позиций, добавление новых товаров, создание и переименование разделов каталога
          </div>
        </div>
      </div>

      <ProductsView
        products={pr.rows as unknown as ProductItem[]}
        categories={cr.rows as unknown as CategoryItem[]}
      />
    </>
  );
}
