'use client';
import { useState } from 'react';
import type { MaterialItem, ProductExtra, ServiceItem } from '@/lib/types';

/* ---------- общий маленький список с полями ---------- */

function RowShell({
  index,
  total,
  title,
  onMove,
  onRemove,
  children,
}: {
  index: number;
  total: number;
  title: string;
  onMove: (dir: -1 | 1) => void;
  onRemove: () => void;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="a-card" style={{ padding: 0, overflow: 'hidden' }}>
      <div
        style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '11px 14px', cursor: 'pointer' }}
        onClick={() => setOpen((v) => !v)}
      >
        <span style={{ fontSize: 12, color: 'var(--muted2)', minWidth: 22 }}>{index + 1}.</span>
        <span style={{ fontWeight: 700, fontSize: 14.5 }}>{title || '— без названия —'}</span>
        <span style={{ marginLeft: 'auto', display: 'flex', gap: 6 }}>
          <button
            type="button"
            className="mini-btn"
            disabled={index === 0}
            onClick={(e) => { e.stopPropagation(); onMove(-1); }}
            title="Выше"
          >
            ↑
          </button>
          <button
            type="button"
            className="mini-btn"
            disabled={index === total - 1}
            onClick={(e) => { e.stopPropagation(); onMove(1); }}
            title="Ниже"
          >
            ↓
          </button>
          <button
            type="button"
            className="mini-btn red"
            onClick={(e) => { e.stopPropagation(); onRemove(); }}
            title="Удалить"
          >
            ✕
          </button>
        </span>
      </div>
      {open && (
        <div style={{ padding: '4px 14px 16px', borderTop: '1px solid var(--line)' }}>{children}</div>
      )}
    </div>
  );
}

/* ---------- материалы ---------- */

export function MaterialsEditor({
  items,
  onChange,
  busy,
}: {
  items: MaterialItem[];
  onChange: (next: MaterialItem[]) => void;
  busy: boolean;
}) {
  const add = () => onChange([...items, { code: '', title_ru: '', std: '' }]);
  const patch = (i: number, p: Partial<MaterialItem>) =>
    onChange(items.map((x, j) => (j === i ? { ...x, ...p } : x)));
  const move = (i: number, dir: -1 | 1) => {
    const j = i + dir;
    if (j < 0 || j >= items.length) return;
    const n = [...items];
    [n[i], n[j]] = [n[j], n[i]];
    onChange(n);
  };

  return (
    <div className="aform">
      <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 16 }}>
        Список материалов и нормативов, который показан на странице «Материалы».
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {items.map((m, i) => (
          <RowShell
            key={i}
            index={i}
            total={items.length}
            title={m.title_ru || m.code}
            onMove={(d) => move(i, d)}
            onRemove={() => onChange(items.filter((_, j) => j !== i))}
          >
            <div className="frow">
              <div className="field">
                <label>Код / обозначение</label>
                <input value={m.code} onChange={(e) => patch(i, { code: e.target.value })} />
              </div>
              <div className="field">
                <label>Название</label>
                <input value={m.title_ru} onChange={(e) => patch(i, { title_ru: e.target.value })} />
              </div>
            </div>
            <div className="field">
              <label>Описание / стандарт</label>
              <textarea rows={2} value={m.std} onChange={(e) => patch(i, { std: e.target.value })} />
            </div>
          </RowShell>
        ))}
      </div>
      <button type="button" className="mini-btn" style={{ marginTop: 12 }} disabled={busy} onClick={add}>
        + Добавить материал
      </button>
    </div>
  );
}

/* ---------- услуги ---------- */

export function ServicesEditor({
  items,
  onChange,
  busy,
}: {
  items: ServiceItem[];
  onChange: (next: ServiceItem[]) => void;
  busy: boolean;
}) {
  const add = () =>
    onChange([...items, { num: String(items.length + 1), title_ru: '', body_ru: '', list_ru: [] }]);
  const patch = (i: number, p: Partial<ServiceItem>) =>
    onChange(items.map((x, j) => (j === i ? { ...x, ...p } : x)));
  const move = (i: number, dir: -1 | 1) => {
    const j = i + dir;
    if (j < 0 || j >= items.length) return;
    const n = [...items];
    [n[i], n[j]] = [n[j], n[i]];
    onChange(n);
  };

  return (
    <div className="aform">
      <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 16 }}>
        Список услуг, который показан на странице «Услуги».
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {items.map((s, i) => (
          <RowShell
            key={i}
            index={i}
            total={items.length}
            title={s.title_ru || s.num}
            onMove={(d) => move(i, d)}
            onRemove={() => onChange(items.filter((_, j) => j !== i))}
          >
            <div className="field">
              <label>Название услуги</label>
              <input value={s.title_ru} onChange={(e) => patch(i, { title_ru: e.target.value })} />
            </div>
            <div className="field">
              <label>Описание</label>
              <textarea rows={2} value={s.body_ru} onChange={(e) => patch(i, { body_ru: e.target.value })} />
            </div>
            <div className="field">
              <label>Пункты списком</label>
              <textarea
                rows={4}
                value={(s.list_ru ?? []).join('\n')}
                onChange={(e) =>
                  patch(i, {
                    list_ru: e.target.value
                      .split('\n')
                      .map((x) => x.trim())
                      .filter(Boolean),
                  })
                }
                placeholder={'Каждый пункт с новой строки'}
              />
              <div style={{ fontSize: 12, color: 'var(--muted2)', marginTop: 4 }}>
                Если оставить пустым — покажется только описание
              </div>
            </div>
          </RowShell>
        ))}
      </div>
      <button type="button" className="mini-btn" style={{ marginTop: 12 }} disabled={busy} onClick={add}>
        + Добавить услугу
      </button>
    </div>
  );
}

/* ---------- общий текст на странице товара ---------- */

export function ProductExtraEditor({
  value,
  onChange,
}: {
  value: ProductExtra;
  onChange: (next: ProductExtra) => void;
}) {
  return (
    <div className="aform">
      <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 16 }}>
        Этот текст и галочки показываются на странице каждого товара. Если у конкретного товара
        заполнены свои поля «Поставка и гарантии» и «Галочки» — они будут использованы вместо общих.
      </p>
      <div className="field">
        <label>Текст про поставку</label>
        <textarea
          rows={3}
          value={value.supply_ru}
          onChange={(e) => onChange({ ...value, supply_ru: e.target.value })}
        />
        <div style={{ fontSize: 12, color: 'var(--muted2)', marginTop: 4 }}>
          Оставьте пустым — блок «Поставка» не будет показан
        </div>
      </div>
      <div className="field">
        <label>Галочки под описанием</label>
        <textarea
          rows={5}
          value={(value.features_ru ?? []).join('\n')}
          onChange={(e) =>
            onChange({
              ...value,
              features_ru: e.target.value
                .split('\n')
                .map((x) => x.trim())
                .filter(Boolean),
            })
          }
          placeholder={'Каждая галочка с новой строки'}
        />
        <div style={{ fontSize: 12, color: 'var(--muted2)', marginTop: 4 }}>
          Каждая с новой строки. Пусто — галочек не будет
        </div>
      </div>
    </div>
  );
}
