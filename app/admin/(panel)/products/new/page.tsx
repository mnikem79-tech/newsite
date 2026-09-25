import { q } from '@/lib/db';
import ProductForm from '../product-form';

export const dynamic = 'force-dynamic';

export default async function NewProductPage() {
  const cats = await q('SELECT * FROM categories ORDER BY position');
  return (
    <>
      <div className="a-head">
        <div>
          <h1>Новый товар</h1>
          <div className="sub">Добавление позиции в каталог</div>
        </div>
      </div>
      <ProductForm categories={cats.rows} initial={null} />
    </>
  );
}
