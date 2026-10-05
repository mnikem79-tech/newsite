'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { PageItem } from '@/lib/types';

function slugify(s: string): string {
  const map: Record<string, string> = {
    а: 'a', б: 'b', в: 'v', г: 'g', д: 'd', е: 'e', ё: 'e', ж: 'zh', з: 'z', и: 'i', й: 'y',
    к: 'k', л: 'l', м: 'm', н: 'n', о: 'o', п: 'p', р: 'r', с: 's', т: 't', у: 'u', ф: 'f',
    х: 'h', ц: 'c', ч: 'ch', ш: 'sh', щ: 'sch', ъ: '', ы: 'y', ь: '', э: 'e', ю: 'yu', я: 'ya',
  };
  return String(s)
    .toLowerCase()
    .replace(/[а-яё]/g, (ch) => map[ch] ?? '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);
}

/** Управление страницами сайта: добавить, переименовать, скрыть, удалить, порядок. */
export default function PagesManager({
  pages,
  onClose,
  onChanged,
}: {
  pages: PageItem[];
  onClose: () => void;
  onChanged: () => void;
}) {
  const router = useRouter();
  const [list, setList] = useState<PageItem[]>(pages);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);
  const [newTitle, setNewTitle] = useState('');
  const [newSlug, setNewSlug] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editTitle, setEditTitle] = useState('');

  const reload = () => {
    router.refresh();
    onChanged();
  };

  const add = async (e: React.FormEvent) => {
    e.preventDefault();
    const title = newTitle.trim();
    if (!title) return;
    setBusy(true);
    setErr(null);
    setOk(null);
    try {
      const res = await fetch('/api/pages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title_ru: title, slug: newSlug.trim() || slugify(title) }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Не удалось создать страницу');
      setOk(`Страница «${title}» создана по адресу /${data.slug}`);
      setTimeout(() => setOk(null), 4000);
      setNewTitle('');
      setNewSlug('');
      reload();
    } catch (ex) {
      setErr(ex instanceof Error ? ex.message : String(ex));
    } finally {
      setBusy(false);
    }
  };

  const patch = async (p: PageItem, changes: Partial<PageItem>) => {
    setBusy(true);
    setErr(null);
    try {
      const res = await fetch(`/api/pages/${p.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title_ru: changes.title_ru ?? p.title_ru,
          is_active: changes.is_active ?? p.is_active,
          in_menu: changes.in_menu ?? p.in_menu,
          position: p.position,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Не удалось сохранить');
      setList((prev) => prev.map((x) => (x.id === p.id ? { ...x, ...changes } : x)));
      reload();
    } catch (ex) {
      setErr(ex instanceof Error ? ex.message : String(ex));
    } finally {
      setBusy(false);
    }
  };

  const remove = async (p: PageItem) => {
    if (p.is_system) return;
    if (!confirm(`Удалить страницу «${p.title_ru}»?\n\nАдрес /${p.slug} перестанет работать, все её блоки будут удалены. Действие необратимо.`)) return;
    setBusy(true);
    setErr(null);
    try {
      const res = await fetch(`/api/pages/${p.id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Не удалось удалить');
      setOk(`Страница «${p.title_ru}» удалена`);
      setTimeout(() => setOk(null), 4000);
      setList((prev) => prev.filter((x) => x.id !== p.id));
      reload();
    } catch (ex) {
      setErr(ex instanceof Error ? ex.message : String(ex));
    } finally {
      setBusy(false);
    }
  };

  const move = async (i: number, dir: -1 | 1) => {
    const j = i + dir;
    if (j < 0 || j >= list.length) return;
    const next = [...list];
    [next[i], next[j]] = [next[j], next[i]];
    // пересчитываем позиции и сохраняем все порядком
    setList(next);
    setBusy(true);
    setErr(null);
    try {
      for (let k = 0; k < next.length; k += 1) {
        // eslint-disable-next-line no-await-in-loop
        await fetch(`/api/pages/${next[k].id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title_ru: next[k].title_ru,
            is_active: next[k].is_active,
            in_menu: next[k].in_menu,
            position: k + 1,
          }),
        });
      }
      reload();
    } catch (ex) {
      setErr(ex instanceof Error ? ex.message : String(ex));
    } finally {
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
      <div className="a-card" style={{ width: '100%', maxWidth: 780, maxHeight: '92vh', overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
          <h3 style={{ margin: 0, fontSize: 19 }}>Страницы сайта</h3>
          <button type="button" className="mini-btn red" onClick={onClose} aria-label="Закрыть">
            ✕
          </button>
        </div>
        <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 18 }}>
          Добавленные страницы сразу работают по адресу <code>/{'{название}'}</code>. Скрытая страница
          отдаёт ошибку 404 и исчезает из меню. Системные страницы (главная, каталог, корзина,
          оформление) удалить нельзя — их логику держит код.
        </p>

        {err && <div className="alert err" style={{ marginBottom: 14 }}>{err}</div>}
        {ok && <div className="alert ok" style={{ marginBottom: 14 }}>{ok}</div>}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {list.map((p, i) => (
            <div
              key={p.id}
              className="a-card"
              style={{ padding: '11px 14px', opacity: p.is_active ? 1 : 0.55 }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                <span style={{ fontSize: 12, color: 'var(--muted2)', minWidth: 22 }}>{i + 1}.</span>

                {editingId === p.id ? (
                  <>
                    <input
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      style={{ maxWidth: 260 }}
                      autoFocus
                    />
                    <button
                      type="button"
                      className="mini-btn"
                      disabled={busy || !editTitle.trim()}
                      onClick={async () => {
                        await patch(p, { title_ru: editTitle.trim() });
                        setEditingId(null);
                      }}
                    >
                      💾 ОК
                    </button>
                    <button type="button" className="mini-btn" onClick={() => setEditingId(null)}>
                      Отмена
                    </button>
                  </>
                ) : (
                  <>
                    <b style={{ fontSize: 14.5 }}>{p.title_ru}</b>
                    <code style={{ fontSize: 12, color: 'var(--muted2)' }}>/{p.slug}</code>
                    {p.is_system && <span style={{ fontSize: 11.5, color: 'var(--muted2)' }}>· системная</span>}
                    {!p.is_active && <span style={{ fontSize: 11.5, color: '#e0a33e' }}>· скрыта</span>}
                    {!p.in_menu && p.is_active && (
                      <span style={{ fontSize: 11.5, color: 'var(--muted2)' }}>· не в меню</span>
                    )}

                    <span style={{ marginLeft: 'auto', display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                      <button
                        type="button"
                        className="mini-btn"
                        disabled={busy || i === 0}
                        onClick={() => move(i, -1)}
                        title="Выше"
                      >
                        ↑
                      </button>
                      <button
                        type="button"
                        className="mini-btn"
                        disabled={busy || i === list.length - 1}
                        onClick={() => move(i, 1)}
                        title="Ниже"
                      >
                        ↓
                      </button>
                      <button
                        type="button"
                        className="mini-btn"
                        disabled={busy}
                        onClick={() => {
                          setEditingId(p.id);
                          setEditTitle(p.title_ru);
                        }}
                        title="Переименовать"
                      >
                        ✏️
                      </button>
                      <button
                        type="button"
                        className="mini-btn"
                        disabled={busy}
                        onClick={() => patch(p, { in_menu: !p.in_menu })}
                        title={p.in_menu ? 'Убрать из меню' : 'Показать в меню'}
                      >
                        {p.in_menu ? '👁' : '🚫'}
                      </button>
                      <button
                        type="button"
                        className="mini-btn"
                        disabled={busy}
                        onClick={() => patch(p, { is_active: !p.is_active })}
                        title={p.is_active ? 'Скрыть страницу' : 'Включить страницу'}
                      >
                        {p.is_active ? '🔽' : '🔼'}
                      </button>
                      <button
                        type="button"
                        className="mini-btn red"
                        disabled={busy || p.is_system}
                        onClick={() => remove(p)}
                        title={p.is_system ? 'Системную страницу удалить нельзя' : 'Удалить страницу'}
                      >
                        ✕
                      </button>
                    </span>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>

        <form onSubmit={add} style={{ marginTop: 22, borderTop: '1px solid var(--line)', paddingTop: 18 }}>
          <h4 style={{ margin: '0 0 10px', fontSize: 15 }}>Добавить страницу</h4>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'flex-end' }}>
            <div className="field" style={{ flex: '1 1 220px', marginBottom: 0 }}>
              <label>Название</label>
              <input
                value={newTitle}
                onChange={(e) => {
                  setNewTitle(e.target.value);
                  if (!newSlug) setNewSlug(slugify(e.target.value));
                }}
                placeholder="Например: Доставка"
              />
            </div>
            <div className="field" style={{ flex: '1 1 180px', marginBottom: 0 }}>
              <label>Адрес (латиницей)</label>
              <input
                value={newSlug}
                onChange={(e) => setNewSlug(e.target.value)}
                placeholder="dostavka"
              />
            </div>
            <button className="btn primary" disabled={busy || !newTitle.trim()}>
              + Создать
            </button>
          </div>
          <div style={{ fontSize: 12, color: 'var(--muted2)', marginTop: 6 }}>
            Адрес заполняется сам из названия, но можно задать свой. После создания страница появится
            в списке выше и в меню сайта — блоки для неё добавляются в конструкторе.
          </div>
        </form>
      </div>
    </div>
  );
}
