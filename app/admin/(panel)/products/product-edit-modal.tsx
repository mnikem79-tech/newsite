'use client';
import { useState } from 'react';
import RichHtmlEditor from '@/components/editor';

export interface ProductFormValues {
  id?: number;
  code: string;
  category_id: number;
  name_ru: string;
  description_ru: string;
  detail_html: string | null;
  price: number | string | null;
  price_note: string | null;
  is_active: boolean;
  icon: string;
}

/** Product editor shown as a popup on the «Товары» page. */
export default function ProductEditModal({
  categories,
  initial,
  onClose,
  onSaved,
}: {
  categories: { id: number; code: string; name_ru: string }[];
  initial: ProductFormValues | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const blank: ProductFormValues = {
    code: '',
    category_id: categories[0]?.id ?? 0,
    name_ru: '',
    description_ru: '',
    detail_html: null,
    price: null,
    price_note: null,
    is_active: true,
    icon: '⚡',
  };
  const base = initial ?? blank;

  const [f, setF] = useState({
    ...base,
    code: base.code ?? '',
    name_ru: base.name_ru ?? '',
    description_ru: base.description_ru ?? '',
    detail_html: base.detail_html ?? '',
    price: base.price != null ? String(base.price) : '',
    price_note: base.price_note ?? '',
  });
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [ok, setOk] = useState(false);

  const set =
    (k: string) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setF((p) => ({ ...p, [k]: e.target.value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    setBusy(true);
    try {
      const payload = {
        ...f,
        category_id: Number(f.category_id),
        price: f.price === '' ? null : Number(f.price),
        detail_html: f.detail_html.trim() || null,
      };
      const res = await fetch(initial?.id ? `/api/products/${initial.id}` : '/api/products', {
        method: initial?.id ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Не удалось сохранить');
      setOk(true);
      onSaved();
      setTimeout(onClose, 600);
    } catch (ex) {
      setErr(ex instanceof Error ? ex.message : String(ex));
      setBusy(false);
    }
  };

  return (
    <div
      className="pmodal-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
    >
      <div className="a-card" style={{ width: '100%', maxWidth: 860, maxHeight: '92vh', overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
          <h3 style={{ margin: 0, fontSize: 19 }}>
            {initial?.id ? `Редактирование товара: ${initial.name_ru || 'без названия'}` : 'Новый товар'}
          </h3>
          <button type="button" className="mini-btn red" onClick={onClose} aria-label="Закрыть">
            ✕
          </button>
        </div>

        <form className="aform" onSubmit={submit}>
          <div className="frow3">
            <div className="field">
              <label>Код позиции</label>
              <input value={f.code} onChange={set('code')} placeholder="2.2.7" />
            </div>
            <div className="field">
              <label>Раздел каталога</label>
              <select value={f.category_id} onChange={set('category_id')}>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.code} · {c.name_ru}
                  </option>
                ))}
              </select>
            </div>
            <div className="field">
              <label>Иконка (эмодзи)</label>
              <input value={f.icon} onChange={set('icon')} maxLength={8} />
            </div>
          </div>

          <div className="field">
            <label>Наименование *</label>
            <input value={f.name_ru} onChange={set('name_ru')} />
          </div>

          <div className="field">
            <label>Короткое описание</label>
            <textarea rows={3} value={f.description_ru} onChange={set('description_ru')} />
            <div style={{ fontSize: 12, color: 'var(--muted2)', marginTop: 4 }}>
              Показывается в карточке товара в каталоге
            </div>
          </div>

          <div className="frow">
            <div className="field">
              <label>
                Цена, ₽ <span style={{ color: 'var(--muted2)', fontWeight: 400 }}>(пусто = «по запросу»)</span>
              </label>
              <input type="number" min="0" step="1" value={f.price} onChange={set('price')} placeholder="—" />
            </div>
            <div className="field">
              <label>Примечание к цене</label>
              <input value={f.price_note} onChange={set('price_note')} placeholder="за 1 шт / от 10 шт" />
            </div>
          </div>

          <div style={{ height: 1, background: 'var(--line)', margin: '22px 0' }} />

          <RichHtmlEditor
            label="Подробное описание (попап «Подробнее»)"
            hint="Это содержимое всплывающего окна, которое открывается по кнопке «Подробнее» в каталоге. Пишите как в текстовом редакторе: выделите текст и нажимайте кнопки сверху. Фотографии вставляются кнопками ниже."
            value={f.detail_html}
            onChange={(v) => setF((p) => ({ ...p, detail_html: v }))}
          />

          <label className="check" style={{ marginTop: 16 }}>
            <input
              type="checkbox"
              checked={f.is_active}
              onChange={(e) => setF((p) => ({ ...p, is_active: e.target.checked }))}
            />
            Показывать в каталоге
          </label>

          {err && <div className="alert err" style={{ marginTop: 16 }}>{err}</div>}
          {ok && <div className="alert ok" style={{ marginTop: 16 }}>Сохранено</div>}

          <div className="form-actions" style={{ marginTop: 20 }}>
            <button className="btn primary" disabled={busy}>
              {busy ? '…' : '💾 Сохранить товар'}
            </button>
            <button type="button" className="btn ghost" onClick={onClose} disabled={busy}>
              Отмена
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
