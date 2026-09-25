'use client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { L } from '@/components/L';

export interface ProductInitial {
  id?: number;
  slug?: string;
  code: string;
  category_id: number;
  name_ru: string;
  name_en: string;
  description_ru: string;
  description_en: string;
  price: number | string | null;
  price_note: string | null;
  is_active: boolean;
  icon: string;
}

export default function ProductForm({
  categories,
  initial,
}: {
  categories: { id: number; code: string; name_ru: string; name_en: string }[];
  initial: ProductInitial | null;
}) {
  const router = useRouter();
  const [f, setF] = useState({
    code: initial?.code ?? '',
    category_id: initial?.category_id ?? categories[0]?.id ?? 0,
    name_ru: initial?.name_ru ?? '',
    name_en: initial?.name_en ?? '',
    description_ru: initial?.description_ru ?? '',
    description_en: initial?.description_en ?? '',
    price: initial?.price != null ? String(initial.price) : '',
    price_note: initial?.price_note ?? '',
    is_active: initial?.is_active ?? true,
    icon: initial?.icon ?? '⚡',
  });
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [ok, setOk] = useState(false);

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
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
      };
      const res = await fetch(initial ? `/api/products/${initial.id}` : '/api/products', {
        method: initial ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'error');
      setOk(true);
      router.refresh();
      setTimeout(() => router.push('/admin/products'), 700);
    } catch (ex) {
      setErr(ex instanceof Error ? ex.message : String(ex));
      setBusy(false);
    }
  };

  return (
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
              <option key={c.id} value={c.id}>{c.code} · {c.name_ru}</option>
            ))}
          </select>
        </div>
        <div className="field">
          <label>Иконка (эмодзи)</label>
          <input value={f.icon} onChange={set('icon')} maxLength={8} />
        </div>
      </div>
      <div className="frow">
        <div className="field">
          <label>Наименование (RU) *</label>
          <input value={f.name_ru} onChange={set('name_ru')} />
        </div>
        <div className="field">
          <label>Наименование (EN)</label>
          <input value={f.name_en} onChange={set('name_en')} />
        </div>
      </div>
      <div className="frow">
        <div className="field">
          <label>Описание (RU)</label>
          <textarea rows={4} value={f.description_ru} onChange={set('description_ru')} />
        </div>
        <div className="field">
          <label>Описание (EN)</label>
          <textarea rows={4} value={f.description_en} onChange={set('description_en')} />
        </div>
      </div>
      <div className="frow">
        <div className="field">
          <label>Цена, ₽ <span style={{ color: 'var(--muted2)', fontWeight: 400 }}>(пусто = «по запросу»)</span></label>
          <input type="number" min="0" step="1" value={f.price} onChange={set('price')} placeholder="—" />
        </div>
        <div className="field">
          <label>Примечание к цене</label>
          <input value={f.price_note} onChange={set('price_note')} placeholder="за 1 шт / от 10 шт" />
        </div>
      </div>
      <label className="check">
        <input type="checkbox" checked={f.is_active} onChange={(e) => setF((p) => ({ ...p, is_active: e.target.checked }))} />
        <L ru="Показывать в каталоге" en="Show in catalog" />
      </label>
      {err && <div className="alert err" style={{ marginTop: 16 }}>{err}</div>}
      {ok && <div className="alert ok" style={{ marginTop: 16 }}>Сохранено</div>}
      <div className="form-actions">
        <button className="btn primary" disabled={busy}>{busy ? '…' : <L ru="Сохранить" en="Save" />}</button>
      </div>
    </form>
  );
}
