'use client';
import { useState } from 'react';
import type { ChromeArea, ChromeKindDef } from '@/lib/chrome';
import { kindsForArea, makeBlock, kindDef } from '@/lib/chrome';
import type { ChromeBlock } from '@/lib/types';

/** Editor for the flexible header / footer: list of blocks, add / edit / reorder / delete. */
export default function ChromeEditor({
  area,
  blocks,
  onChange,
  busy,
}: {
  area: ChromeArea;
  blocks: ChromeBlock[];
  onChange: (next: ChromeBlock[]) => void;
  busy: boolean;
}) {
  const [openId, setOpenId] = useState<string | null>(null);
  const kinds = kindsForArea(area);

  const add = (def: ChromeKindDef) => {
    const b = makeBlock(def.kind, area);
    onChange([...blocks, b]);
    setOpenId(b.id);
  };

  const patch = (id: string, p: Partial<ChromeBlock>) =>
    onChange(blocks.map((b) => (b.id === id ? { ...b, ...p } : b)));

  const remove = (id: string) => {
    onChange(blocks.filter((b) => b.id !== id));
    if (openId === id) setOpenId(null);
  };

  const move = (id: string, dir: -1 | 1) => {
    const i = blocks.findIndex((b) => b.id === id);
    const j = i + dir;
    if (i < 0 || j < 0 || j >= blocks.length) return;
    const next = [...blocks];
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next);
  };

  return (
    <div className="aform">
      <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 16 }}>
        {area === 'header'
          ? 'Шапка собирается из блоков. Добавьте нужные блоки и расставьте их в нужном порядке — сверху вниз = слева направо на сайте.'
          : 'Подвал собирается из блоков. Блоки выстраиваются в колонки слева направо.'}{' '}
        Блок «Свой HTML» позволяет вставить произвольную вёрстку.
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {blocks.map((b, i) => {
          const def = kindDef(b.kind);
          const open = openId === b.id;
          return (
            <div
              key={b.id}
              className="a-card"
              style={{ padding: 0, opacity: b.is_active ? 1 : 0.55, overflow: 'hidden' }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '11px 14px',
                  cursor: 'pointer',
                }}
                onClick={() => setOpenId(open ? null : b.id)}
              >
                <span style={{ fontWeight: 700, fontSize: 14.5 }}>{b.name || def.label}</span>
                <span style={{ fontSize: 12, color: 'var(--muted2)' }}>{def.label}</span>
                {!b.is_active && (
                  <span style={{ fontSize: 12, color: '#e0a33e' }}>· скрыт</span>
                )}
                <span style={{ marginLeft: 'auto', display: 'flex', gap: 6 }}>
                  <button
                    type="button"
                    className="mini-btn"
                    disabled={busy || i === 0}
                    onClick={(e) => { e.stopPropagation(); move(b.id, -1); }}
                    title="Выше"
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    className="mini-btn"
                    disabled={busy || i === blocks.length - 1}
                    onClick={(e) => { e.stopPropagation(); move(b.id, 1); }}
                    title="Ниже"
                  >
                    ↓
                  </button>
                  <button
                    type="button"
                    className="mini-btn"
                    disabled={busy}
                    onClick={(e) => { e.stopPropagation(); patch(b.id, { is_active: !b.is_active }); }}
                    title={b.is_active ? 'Скрыть блок' : 'Показать блок'}
                  >
                    {b.is_active ? '👁' : '🚫'}
                  </button>
                  <button
                    type="button"
                    className="mini-btn red"
                    disabled={busy}
                    onClick={(e) => { e.stopPropagation(); remove(b.id); }}
                    title="Удалить блок"
                  >
                    ✕
                  </button>
                </span>
              </div>

              {open && (
                <div style={{ padding: '4px 14px 16px', borderTop: '1px solid var(--line)' }}>
                  <p style={{ fontSize: 12.5, color: 'var(--muted)', margin: '12px 0' }}>{def.hint}</p>

                  <div className="field">
                    <label>Название блока (видно только в админке)</label>
                    <input
                      value={b.name}
                      onChange={(e) => patch(b.id, { name: e.target.value })}
                      placeholder={def.label}
                    />
                  </div>

                  {def.fields.includes('text') && (
                    <div className="field">
                      <label>
                        {b.kind === 'topbar'
                          ? 'Текст в верхней полоске'
                          : b.kind === 'socials'
                            ? 'Текст кнопки'
                            : b.kind === 'button'
                              ? 'Текст кнопки'
                              : b.kind === 'links'
                                ? 'Заголовок колонки'
                                : b.kind === 'copyright'
                                  ? 'Текст копирайта'
                                  : b.kind === 'logo'
                                    ? 'Подпись рядом с логотипом'
                                    : 'Текст'}
                      </label>
                      <input
                        value={b.text ?? ''}
                        onChange={(e) => patch(b.id, { text: e.target.value })}
                      />
                    </div>
                  )}

                  {def.fields.includes('href') && (
                    <div className="field">
                      <label>Ссылка кнопки</label>
                      <input
                        value={b.href ?? ''}
                        onChange={(e) => patch(b.id, { href: e.target.value })}
                        placeholder="/contacts"
                      />
                    </div>
                  )}

                  {def.fields.includes('lines') && (
                    <div className="field">
                      <label>Ссылки — каждая с новой строки: Название | /адрес</label>
                      <textarea
                        rows={6}
                        value={b.lines ?? ''}
                        onChange={(e) => patch(b.id, { lines: e.target.value })}
                      />
                    </div>
                  )}

                  {def.fields.includes('html_ru') && (
                    <div className="field">
                      <label>HTML-код блока</label>
                      <textarea
                        rows={8}
                        value={b.html_ru ?? ''}
                        onChange={(e) => patch(b.id, { html_ru: e.target.value })}
                      />
                    </div>
                  )}

                  {def.fields.length === 0 && (
                    <p style={{ fontSize: 12.5, color: 'var(--muted)', marginTop: 10 }}>
                      Этот блок не требует настроек — он сам берёт данные из разделов «Шапка и подвал» и «Контакты».
                    </p>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <h3 style={{ fontSize: 15, fontWeight: 700, margin: '22px 0 10px' }}>Добавить блок</h3>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        {kinds.map((k) => (
          <button
            key={k.kind}
            type="button"
            className="mini-btn"
            disabled={busy}
            onClick={() => add(k)}
            title={k.hint}
          >
            + {k.label}
          </button>
        ))}
      </div>
    </div>
  );
}
