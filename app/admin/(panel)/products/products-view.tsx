'use client';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import ProductActions from './product-actions';
import ProductEditModal, { type ProductFormValues } from './product-edit-modal';

export interface CategoryItem {
  id: number;
  slug: string;
  code: string;
  name_ru: string;
  note_ru: string | null;
  icon: string;
  position: number;
  products_count?: number;
}

export interface ProductItem {
  id: number;
  code: string;
  name_ru: string;
  description_ru: string;
  detail_html: string | null;
  cat_code: string;
  cat_ru: string;
  category_id: number;
  price: number | string | null;
  price_note: string | null;
  is_active: boolean;
  icon: string;
  position: number;
}

interface Props {
  products: ProductItem[];
  categories: CategoryItem[];
}

export default function ProductsView({ products, categories: initialCategories }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialTab = searchParams.get('tab') === 'categories' ? 'categories' : 'products';
  const [tab, setTab] = useState<'products' | 'categories'>(initialTab);

  // Product editor popup
  const [editOpen, setEditOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductFormValues | null>(null);

  // Categories management state
  const [categories, setCategories] = useState<CategoryItem[]>(initialCategories);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCat, setEditingCat] = useState<CategoryItem | null>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);

  // Поиск по товарам
  const [q, setQ] = useState('');
  // Локальный порядок внутри раздела: category_id -> массив id в нужном порядке
  const [order, setOrder] = useState<Record<number, number[]>>({});

  const query = q.trim().toLowerCase();
  const searching = query.length > 0;

  // Применяем поиск, затем локальный порядок внутри каждого раздела
  const visibleProducts = (() => {
    const base = searching
      ? products.filter(
          (p) =>
            p.name_ru.toLowerCase().includes(query) ||
            p.code.toLowerCase().includes(query) ||
            p.cat_ru.toLowerCase().includes(query) ||
            (p.description_ru || '').toLowerCase().includes(query)
        )
      : products;

    const byCat = new Map<number, ProductItem[]>();
    for (const p of base) {
      if (!byCat.has(p.category_id)) byCat.set(p.category_id, []);
      byCat.get(p.category_id)!.push(p);
    }
    const out: ProductItem[] = [];
    for (const [catId, items] of byCat) {
      const ids = order[catId];
      if (ids && ids.length === items.length && ids.every((id) => items.some((i) => i.id === id))) {
        const map = new Map(items.map((i) => [i.id, i]));
        for (const id of ids) out.push(map.get(id)!);
      } else {
        out.push(...items);
      }
    }
    return out;
  })();

  // Номер товара внутри своего раздела — для показа в колонке «#»
  const positionInCategory = new Map<number, number>();
  {
    const seen = new Map<number, number>();
    for (const p of visibleProducts) {
      seen.set(p.category_id, (seen.get(p.category_id) || 0) + 1);
      positionInCategory.set(p.id, seen.get(p.category_id)!);
    }
  }

  const moveProduct = async (p: ProductItem, dir: -1 | 1) => {
    const list = visibleProducts;
    const idx = list.findIndex((x) => x.id === p.id);
    if (idx < 0) return;

    // ищем ближайшего соседа в том же разделе
    let target = idx + dir;
    while (target >= 0 && target < list.length && list[target].category_id !== p.category_id) {
      target += dir;
    }
    if (target < 0 || target >= list.length) return;

    const next = [...list];
    [next[idx], next[target]] = [next[target], next[idx]];
    const catIds = next.filter((x) => x.category_id === p.category_id).map((x) => x.id);

    setOrder((prev) => ({ ...prev, [p.category_id]: catIds }));
    setBusy(true);
    setErr(null);
    try {
      const res = await fetch('/api/products/reorder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category_id: p.category_id, ids: catIds }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Не удалось сохранить порядок');
      setOk(`Порядок в разделе «${p.cat_ru}» сохранён`);
      setTimeout(() => setOk(null), 3000);
      router.refresh();
    } catch (ex) {
      setErr(ex instanceof Error ? ex.message : String(ex));
      setOrder((prev) => {
        const copy = { ...prev };
        delete copy[p.category_id];
        return copy;
      });
    } finally {
      setBusy(false);
    }
  };

  // Form fields
  const [formCode, setFormCode] = useState('');
  const [formIcon, setFormIcon] = useState('⚡');
  const [formNameRu, setFormNameRu] = useState('');
  const [formNoteRu, setFormNoteRu] = useState('');
  const [formPos, setFormPos] = useState(1);

  const openAddModal = () => {
    setEditingCat(null);
    setFormCode('');
    setFormIcon('⚡');
    setFormNameRu('');
    setFormNoteRu('');
    setFormPos(categories.length + 1);
    setErr(null);
    setModalOpen(true);
  };

  const openEditModal = (cat: CategoryItem) => {
    setEditingCat(cat);
    setFormCode(cat.code || '');
    setFormIcon(cat.icon || '⚡');
    setFormNameRu(cat.name_ru || '');
    setFormNoteRu(cat.note_ru || '');
    setFormPos(cat.position || 1);
    setErr(null);
    setModalOpen(true);
  };

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formNameRu.trim()) {
      setErr('Пожалуйста, укажите название раздела');
      return;
    }
    setBusy(true);
    setErr(null);

    const payload = {
      code: formCode.trim() || '—',
      icon: formIcon.trim() || '⚡',
      name_ru: formNameRu.trim(),
      note_ru: formNoteRu.trim(),
      position: Number(formPos) || 1,
    };

    try {
      const url = editingCat ? `/api/categories/${editingCat.id}` : '/api/categories';
      const method = editingCat ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Ошибка при сохранении раздела');

      setOk(editingCat ? 'Раздел успешно изменён!' : 'Новый раздел добавлен!');
      setTimeout(() => setOk(null), 3000);
      setModalOpen(false);
      router.refresh();

      // Refresh local list
      const r = await fetch('/api/categories');
      const list = await r.json();
      if (Array.isArray(list)) setCategories(list);
    } catch (ex) {
      setErr(ex instanceof Error ? ex.message : String(ex));
    } finally {
      setBusy(false);
    }
  };

  const handleDeleteCategory = async (cat: CategoryItem) => {
    if ((cat.products_count || 0) > 0) {
      alert(`Нельзя удалить раздел «${cat.name_ru}», так как в нём находится товаров: ${cat.products_count}. Сначала переместите товары в другой раздел или удалите их.`);
      return;
    }

    if (!confirm(`Удалить раздел «${cat.name_ru}»?`)) return;

    setBusy(true);
    try {
      const res = await fetch(`/api/categories/${cat.id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Ошибка при удалении');

      setCategories((prev) => prev.filter((c) => c.id !== cat.id));
      setOk(`Раздел «${cat.name_ru}» удалён`);
      setTimeout(() => setOk(null), 3000);
      router.refresh();
    } catch (ex) {
      alert(ex instanceof Error ? ex.message : String(ex));
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      {err && <div className="alert err" style={{ marginBottom: 16 }}>{err}</div>}
      {ok && <div className="alert ok" style={{ marginBottom: 16 }}>{ok}</div>}

      {/* Tabs */}
      <div className="a-tabs" style={{ marginBottom: 20 }}>
        <button
          className={tab === 'products' ? 'on' : ''}
          onClick={() => setTab('products')}
        >
          📦 Список товаров ({products.length})
        </button>
        <button
          className={tab === 'categories' ? 'on' : ''}
          onClick={() => setTab('categories')}
        >
          📁 Разделы каталога ({categories.length})
        </button>
      </div>

      {/* ========================================================
          TAB 1: PRODUCTS LIST
          ======================================================== */}
      {tab === 'products' && (
        <>
          <div className="a-head">
            <div>
              <h2 style={{ fontSize: 20, margin: 0 }}>Товары каталога</h2>
              <div className="sub">
                {searching
                  ? `Найдено: ${visibleProducts.length} из ${products.length}`
                  : `${products.length} позиций в каталоге`}
              </div>
            </div>
            <button
              className="btn primary sm"
              onClick={() => {
                setEditingProduct(null);
                setEditOpen(true);
              }}
            >
              + Добавить товар
            </button>
          </div>

          <div className="field" style={{ marginBottom: 14, maxWidth: 460 }}>
            <label>Поиск товара</label>
            <input
              placeholder="Название, код, раздел или описание"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
            {searching && (
              <button className="mini-btn" style={{ marginTop: 8 }} onClick={() => setQ('')}>
                Сбросить поиск
              </button>
            )}
          </div>

          <div className="atable-wrap">
            <table className="atable">
              <thead>
                <tr>
                  <th style={{ width: 92 }}>#</th>
                  <th>Код</th>
                  <th>Наименование</th>
                  <th>Раздел</th>
                  <th>Цена</th>
                  <th>Статус</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {visibleProducts.length === 0 && (
                  <tr>
                    <td colSpan={7} className="muted" style={{ textAlign: 'center', padding: 24 }}>
                      {searching ? 'Ничего не найдено. Попробуйте другой запрос.' : 'Товаров пока нет.'}
                    </td>
                  </tr>
                )}
                {visibleProducts.map((p) => (
                  <tr key={p.id}>
                    <td>
                      {!searching ? (
                        <div className="act" style={{ gap: 2 }}>
                          <button
                            className="mini-btn"
                            title="Выше"
                            disabled={busy}
                            onClick={() => moveProduct(p, -1)}
                          >
                            ↑
                          </button>
                          <button
                            className="mini-btn"
                            title="Ниже"
                            disabled={busy}
                            onClick={() => moveProduct(p, 1)}
                          >
                            ↓
                          </button>
                          <span className="muted" style={{ marginLeft: 4, fontSize: 12 }}>
                            {positionInCategory.get(p.id)}
                          </span>
                        </div>
                      ) : (
                        <span className="muted">—</span>
                      )}
                    </td>
                    <td className="mono">{p.code}</td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{p.name_ru}</div>
                    </td>
                    <td className="muted">{p.cat_code} · {p.cat_ru}</td>
                    <td>
                      {p.price != null
                        ? `${new Intl.NumberFormat('ru-RU').format(Number(p.price))} ₽`
                        : <span className="muted">по запросу</span>}
                    </td>
                    <td>
                      {p.is_active ? <span className="st done">активен</span> : <span className="st canceled">скрыт</span>}
                    </td>
                    <td>
                      <div className="act">
                        <button
                          className="mini-btn"
                          onClick={() => {
                            setEditingProduct({
                              id: p.id,
                              code: p.code,
                              category_id: p.category_id,
                              name_ru: p.name_ru,
                              description_ru: p.description_ru,
                              detail_html: p.detail_html,
                              price: p.price,
                              price_note: p.price_note,
                              is_active: p.is_active,
                              icon: p.icon,
                            });
                            setEditOpen(true);
                          }}
                        >
                          Изменить
                        </button>
                        <ProductActions id={p.id} name={p.name_ru} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* ========================================================
          TAB 2: CATEGORIES (РАЗДЕЛЫ КАТАЛОГА)
          ======================================================== */}
      {tab === 'categories' && (
        <>
          <div className="a-head">
            <div>
              <h2 style={{ fontSize: 20, margin: 0 }}>Разделы каталога (категории продукции)</h2>
              <div className="sub">
                Здесь можно менять названия разделов, создавать новые разделы и упорядочивать их. Они отображаются на главной странице и в каталоге.
              </div>
            </div>
            <button className="btn primary sm" onClick={openAddModal}>
              + Добавить раздел
            </button>
          </div>

          <div className="atable-wrap">
            <table className="atable">
              <thead>
                <tr>
                  <th style={{ width: 45 }}>#</th>
                  <th style={{ width: 50 }}>Иконка</th>
                  <th style={{ width: 90 }}>Код</th>
                  <th>Название раздела</th>
                  <th>Описание</th>
                  <th style={{ textAlign: 'center', width: 100 }}>Товаров</th>
                  <th style={{ width: 170 }}></th>
                </tr>
              </thead>
              <tbody>
                {categories.map((c, idx) => (
                  <tr key={c.id}>
                    <td style={{ color: 'var(--muted2)', fontWeight: 700 }}>{c.position || idx + 1}</td>
                    <td style={{ fontSize: 22, textAlign: 'center' }}>{c.icon || '⚡'}</td>
                    <td className="mono" style={{ fontWeight: 600 }}>{c.code}</td>
                    <td>
                      <div style={{ fontWeight: 700, fontSize: 14 }}>{c.name_ru}</div>
                    </td>
                    <td style={{ fontSize: 12.5, color: 'var(--muted)', maxWidth: 320 }}>
                      {c.note_ru || '—'}
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <span className={`badge ${Number(c.products_count) > 0 ? 'badge-acc' : ''}`} style={{ fontSize: 12, padding: '3px 9px', borderRadius: 999 }}>
                        {c.products_count ?? 0}
                      </span>
                    </td>
                    <td>
                      <div className="act">
                        <button
                          type="button"
                          className="mini-btn"
                          onClick={() => openEditModal(c)}
                        >
                          ✏️ Изменить
                        </button>
                        <button
                          type="button"
                          className="mini-btn red"
                          onClick={() => handleDeleteCategory(c)}
                          title="Удалить раздел"
                        >
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* ========================================================
          MODAL: ADD / EDIT CATEGORY
          ======================================================== */}
      {/* Попап редактирования товара */}
      {editOpen && (
        <ProductEditModal
          categories={categories}
          initial={editingProduct}
          onClose={() => setEditOpen(false)}
          onSaved={() => router.refresh()}
        />
      )}

      {modalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.7)',
            backdropFilter: 'blur(4px)',
            display: 'grid',
            placeItems: 'center',
            zIndex: 100,
            padding: 20,
          }}
          onClick={() => setModalOpen(false)}
        >
          <div
            className="a-card"
            style={{ width: '100%', maxWidth: 600, maxHeight: '90vh', overflowY: 'auto' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
              <h3 style={{ margin: 0, fontSize: 18 }}>
                {editingCat ? `Редактирование раздела: ${editingCat.name_ru}` : 'Добавить новый раздел каталога'}
              </h3>
              <button className="mini-btn red" onClick={() => setModalOpen(false)}>✕</button>
            </div>

            <form onSubmit={handleSaveCategory}>
              <div className="frow" style={{ marginBottom: 14 }}>
                <div className="field">
                  <label>Код раздела (например, 2.10 или KRM)</label>
                  <input
                    value={formCode}
                    onChange={(e) => setFormCode(e.target.value)}
                    placeholder="2.10"
                  />
                </div>
                <div className="field">
                  <label>Иконка (эмодзи)</label>
                  <input
                    value={formIcon}
                    onChange={(e) => setFormIcon(e.target.value)}
                    maxLength={8}
                    placeholder="⚡"
                  />
                </div>
                <div className="field" style={{ maxWidth: 110 }}>
                  <label>Порядок</label>
                  <input
                    type="number"
                    min="1"
                    value={formPos}
                    onChange={(e) => setFormPos(Number(e.target.value))}
                  />
                </div>
              </div>

              <div className="field" style={{ marginBottom: 14 }}>
                <label>Название раздела *</label>
                <input
                  value={formNameRu}
                  onChange={(e) => setFormNameRu(e.target.value)}
                  placeholder="Например: Силовые трансформаторы"
                  required
                />
              </div>

              <div className="field" style={{ marginBottom: 18 }}>
                <label>Краткое описание — показывается в карточке на главной и в каталоге</label>
                <textarea
                  rows={3}
                  value={formNoteRu}
                  onChange={(e) => setFormNoteRu(e.target.value)}
                  placeholder="Краткое описание продукции данного раздела..."
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, paddingTop: 14, borderTop: '1px solid var(--line)' }}>
                <button type="button" className="btn ghost sm" onClick={() => setModalOpen(false)}>
                  Отмена
                </button>
                <button type="submit" className="btn primary sm" disabled={busy}>
                  {busy ? 'Сохранение…' : editingCat ? '💾 Сохранить изменения' : '+ Создать раздел'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
