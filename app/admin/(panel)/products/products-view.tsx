'use client';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import ProductActions from './product-actions';

export interface CategoryItem {
  id: number;
  slug: string;
  code: string;
  name_ru: string;
  name_en: string;
  note_ru: string | null;
  note_en: string | null;
  icon: string;
  position: number;
  products_count?: number;
}

export interface ProductItem {
  id: number;
  code: string;
  name_ru: string;
  name_en: string;
  cat_code: string;
  cat_ru: string;
  category_id: number;
  price: number | string | null;
  is_active: boolean;
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

  // Categories management state
  const [categories, setCategories] = useState<CategoryItem[]>(initialCategories);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCat, setEditingCat] = useState<CategoryItem | null>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);

  // Form fields
  const [formCode, setFormCode] = useState('');
  const [formIcon, setFormIcon] = useState('⚡');
  const [formNameRu, setFormNameRu] = useState('');
  const [formNameEn, setFormNameEn] = useState('');
  const [formNoteRu, setFormNoteRu] = useState('');
  const [formNoteEn, setFormNoteEn] = useState('');
  const [formPos, setFormPos] = useState(1);

  const openAddModal = () => {
    setEditingCat(null);
    setFormCode('');
    setFormIcon('⚡');
    setFormNameRu('');
    setFormNameEn('');
    setFormNoteRu('');
    setFormNoteEn('');
    setFormPos(categories.length + 1);
    setErr(null);
    setModalOpen(true);
  };

  const openEditModal = (cat: CategoryItem) => {
    setEditingCat(cat);
    setFormCode(cat.code || '');
    setFormIcon(cat.icon || '⚡');
    setFormNameRu(cat.name_ru || '');
    setFormNameEn(cat.name_en || '');
    setFormNoteRu(cat.note_ru || '');
    setFormNoteEn(cat.note_en || '');
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
      name_en: formNameEn.trim() || formNameRu.trim(),
      note_ru: formNoteRu.trim(),
      note_en: formNoteEn.trim(),
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
              <div className="sub">{products.length} позиций в каталоге</div>
            </div>
            <Link href="/admin/products/new" className="btn primary sm">
              + Добавить товар
            </Link>
          </div>

          <div className="atable-wrap">
            <table className="atable">
              <thead>
                <tr>
                  <th>Код</th>
                  <th>Наименование</th>
                  <th>Раздел</th>
                  <th>Цена</th>
                  <th>Статус</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => (
                  <tr key={p.id}>
                    <td className="mono">{p.code}</td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{p.name_ru}</div>
                      {p.name_en !== p.name_ru && <div className="muted">{p.name_en}</div>}
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
                        <Link href={`/admin/products/${p.id}`} className="mini-btn">Изменить</Link>
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
                      {c.name_en && c.name_en !== c.name_ru && (
                        <div style={{ fontSize: 12, color: 'var(--muted2)', marginTop: 2 }}>{c.name_en}</div>
                      )}
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
                <label>Название раздела (RU) *</label>
                <input
                  value={formNameRu}
                  onChange={(e) => setFormNameRu(e.target.value)}
                  placeholder="Например: Силовые трансформаторы"
                  required
                />
              </div>

              <div className="field" style={{ marginBottom: 14 }}>
                <label>Название раздела (EN)</label>
                <input
                  value={formNameEn}
                  onChange={(e) => setFormNameEn(e.target.value)}
                  placeholder="Например: Power transformers"
                />
              </div>

              <div className="field" style={{ marginBottom: 14 }}>
                <label>Краткое описание (RU) — показывается в карточке на главной и в каталоге</label>
                <textarea
                  rows={3}
                  value={formNoteRu}
                  onChange={(e) => setFormNoteRu(e.target.value)}
                  placeholder="Краткое описание продукции данного раздела..."
                />
              </div>

              <div className="field" style={{ marginBottom: 18 }}>
                <label>Краткое описание (EN)</label>
                <textarea
                  rows={3}
                  value={formNoteEn}
                  onChange={(e) => setFormNoteEn(e.target.value)}
                  placeholder="Short description in English..."
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
