'use client';
import { useEffect, useRef, useState } from 'react';
import type { UploadedFile } from '@/lib/types';

/**
 * Универсальный визуальный редактор содержимого.
 *
 * Один компонент на весь проект: товары, блоки страниц, шапка/подвал и всё остальное,
 * где нужно редактирование HTML с кнопками вместо ручной вёрстки.
 *
 * Две вкладки:
 *   • «Визуально»   — панель кнопок, редактирование как в текстовом редакторе
 *   • «HTML-код»    — сырая разметка для тех, кто умеет вёрстку
 *
 * Значение всегда передаётся как строка HTML — тем же форматом, что хранится в базе,
 * поэтому компонент можно использовать где угодно без преобразований.
 */

const COLORS = ['#ffffff', '#22d3ee', '#f59e0b', '#ef4444', '#22c55e', '#a78bfa'];

function isImage(name: string, mime?: string) {
  const ext = (name.split('.').pop() || '').toLowerCase();
  return (mime && mime.startsWith('image/')) || ['jpg', 'jpeg', 'png', 'webp', 'svg', 'gif'].includes(ext);
}

export type PhotoTextSide = 'left' | 'right';

export default function RichHtmlEditor({
  value,
  onChange,
  label = 'Содержимое',
  hint,
  placeholder = 'Начните писать…',
  minHeight = 240,
}: {
  value: string;
  onChange: (html: string) => void;
  label?: string;
  hint?: string;
  placeholder?: string;
  minHeight?: number;
}) {
  const edRef = useRef<HTMLDivElement>(null);
  // последнее значение, которое мы сами отдали наружу — чтобы не перезаписывать своё же
  const lastEmitted = useRef<string>(value ?? '');
  const [mode, setMode] = useState<'visual' | 'code'>('visual');
  const [code, setCode] = useState(value ?? '');
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [picker, setPicker] = useState(false);
  // что сделать после выбора фотографии
  const [pending, setPending] = useState<'inline' | PhotoTextSide | null>(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  // первичная загрузка
  useEffect(() => {
    if (edRef.current) edRef.current.innerHTML = value ?? '';
    lastEmitted.current = value ?? '';
    setCode(value ?? '');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // внешнее изменение значения (шаблон, сниппет, сброс) — подхватываем, если пользователь не печатает
  useEffect(() => {
    const incoming = value ?? '';
    if (incoming === lastEmitted.current) return;
    if (document.activeElement === edRef.current) return;
    if (edRef.current) edRef.current.innerHTML = incoming;
    lastEmitted.current = incoming;
    setCode(incoming);
  }, [value]);

  const sync = () => {
    const html = edRef.current?.innerHTML ?? '';
    lastEmitted.current = html;
    setCode(html);
    onChange(html);
  };

  const exec = (cmd: string, arg?: string) => {
    edRef.current?.focus();
    try {
      document.execCommand(cmd, false, arg);
    } catch {
      /* ignore */
    }
    sync();
  };

  const insertHtml = (html: string) => {
    edRef.current?.focus();
    try {
      document.execCommand('insertHTML', false, html);
    } catch {
      /* ignore */
    }
    sync();
  };

  const loadFiles = async () => {
    try {
      const res = await fetch('/api/uploads');
      const data = await res.json();
      if (Array.isArray(data.files)) setFiles(data.files);
    } catch {
      /* ignore */
    }
  };

  useEffect(() => {
    loadFiles();
  }, []);

  const upload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy(true);
    setMsg(null);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch('/api/uploads', { method: 'POST', body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Не удалось загрузить файл');
      setMsg(`Файл «${file.name}» загружен`);
      setTimeout(() => setMsg(null), 3000);
      await loadFiles();
      if (fileRef.current) fileRef.current.value = '';
      if (data.file?.url) insertImage(data.file.url, data.file.original_name ?? file.name);
    } catch (ex) {
      setMsg(ex instanceof Error ? ex.message : String(ex));
    } finally {
      setBusy(false);
    }
  };

  const insertImage = (url: string, alt: string) => {
    const safeAlt = String(alt).replace(/"/g, '');

    if (pending === 'left' || pending === 'right') {
      const cls =
        pending === 'right' ? 'pt-row pt-row--rev pt-row--center' : 'pt-row pt-row--center';
      insertHtml(
        `\n<div class="${cls}">\n` +
          `  <img class="pt-img" src="${url}" alt="${safeAlt}" />\n` +
          `  <div class="pt-text">\n` +
          `    <p>Текст рядом с фотографией. Напишите здесь описание — на узком экране оно само перейдёт под картинку.</p>\n` +
          `  </div>\n` +
          `</div>\n<p></p>\n`
      );
      setPending(null);
      setPicker(false);
      return;
    }

    insertHtml(
      `\n<img src="${url}" alt="${safeAlt}" style="max-width:100%;height:auto;border-radius:12px;margin:10px 0" />\n`
    );
    setPicker(false);
  };

  const addLink = () => {
    const url = prompt('Адрес ссылки (например https://example.ru или /catalog)');
    if (!url) return;
    exec('createLink', url);
  };

  const addTable = () => {
    const rows = Number(prompt('Сколько строк?', '3') || '0');
    const cols = Number(prompt('Сколько столбцов?', '2') || '0');
    if (!rows || !cols) return;
    let html = '<table style="width:100%;border-collapse:collapse;margin:12px 0"><tbody>';
    for (let r = 0; r < rows; r += 1) {
      html += '<tr>';
      for (let c = 0; c < cols; c += 1) {
        html +=
          r === 0
            ? '<th style="border:1px solid #2a3a52;padding:8px">Заголовок</th>'
            : '<td style="border:1px solid #2a3a52;padding:8px">&nbsp;</td>';
      }
      html += '</tr>';
    }
    html += '</tbody></table><p></p>';
    insertHtml(html);
  };

  const switchTo = (m: 'visual' | 'code') => {
    if (m === mode) return;
    if (m === 'visual') {
      if (edRef.current) edRef.current.innerHTML = code;
      lastEmitted.current = code;
      onChange(code);
    } else {
      setCode(edRef.current?.innerHTML ?? '');
    }
    setMode(m);
  };

  const Btn = ({
    title,
    onClick,
    children,
  }: {
    title: string;
    onClick: () => void;
    children: React.ReactNode;
  }) => (
    <button
      type="button"
      className="rte-btn"
      title={title}
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
    >
      {children}
    </button>
  );

  const images = files.filter((f) => isImage(f.original_name, f.mime_type));

  return (
    <div className="field">
      <label>{label}</label>
      {hint && <div style={{ fontSize: 12.5, color: 'var(--muted)', marginBottom: 8 }}>{hint}</div>}

      <div className="a-tabs" style={{ marginBottom: 10 }}>
        <button type="button" className={mode === 'visual' ? 'on' : ''} onClick={() => switchTo('visual')}>
          ✏️ Визуально
        </button>
        <button type="button" className={mode === 'code' ? 'on' : ''} onClick={() => switchTo('code')}>
          &lt;/&gt; HTML-код
        </button>
      </div>

      {msg && <div className="alert ok" style={{ marginBottom: 10 }}>{msg}</div>}

      {mode === 'visual' ? (
        <>
          <div className="rte-toolbar">
            <Btn title="Жирный" onClick={() => exec('bold')}><b>Ж</b></Btn>
            <Btn title="Курсив" onClick={() => exec('italic')}><i>К</i></Btn>
            <Btn title="Подчёркнутый" onClick={() => exec('underline')}><u>Ч</u></Btn>
            <Btn title="Зачёркнутый" onClick={() => exec('strikeThrough')}><s>З</s></Btn>
            <span className="rte-sep" />
            <Btn title="Обычный текст" onClick={() => exec('formatBlock', 'p')}>¶</Btn>
            <Btn title="Заголовок" onClick={() => exec('formatBlock', 'h3')}>H</Btn>
            <Btn title="Подзаголовок" onClick={() => exec('formatBlock', 'h4')}>h</Btn>
            <span className="rte-sep" />
            <Btn title="Увеличить шрифт" onClick={() => exec('fontSize', '4')}>A+</Btn>
            <Btn title="Обычный размер" onClick={() => exec('fontSize', '3')}>A</Btn>
            <Btn title="Уменьшить шрифт" onClick={() => exec('fontSize', '2')}>A−</Btn>
            <span className="rte-sep" />
            <Btn title="Выровнять по левому краю" onClick={() => exec('justifyLeft')}>⯇</Btn>
            <Btn title="Выровнять по центру" onClick={() => exec('justifyCenter')}>⯈</Btn>
            <Btn title="Выровнять по правому краю" onClick={() => exec('justifyRight')}>⯉</Btn>
            <Btn title="Выровнять по ширине" onClick={() => exec('justifyFull')}>
              <span style={{ transform: 'scaleX(1.3)', display: 'inline-block' }}>≡</span>
            </Btn>
            <span className="rte-sep" />
            <Btn title="Маркированный список" onClick={() => exec('insertUnorderedList')}>•—</Btn>
            <Btn title="Нумерованный список" onClick={() => exec('insertOrderedList')}>1.</Btn>
            <Btn title="Цитата" onClick={() => exec('formatBlock', 'blockquote')}>❝</Btn>
            <Btn title="Разделительная линия" onClick={() => insertHtml('<hr />')}>—</Btn>
            <span className="rte-sep" />
            {COLORS.map((c) => (
              <Btn key={c} title={`Цвет текста ${c}`} onClick={() => exec('foreColor', c)}>
                <span style={{ color: c }}>●</span>
              </Btn>
            ))}
            <span className="rte-sep" />
            <Btn title="Вставить ссылку" onClick={addLink}>🔗</Btn>
            <Btn title="Вставить таблицу" onClick={addTable}>▦</Btn>
            <Btn title="Отменить" onClick={() => exec('undo')}>↶</Btn>
            <Btn title="Повторить" onClick={() => exec('redo')}>↷</Btn>
            <Btn title="Убрать форматирование" onClick={() => exec('removeFormat')}>✕ф</Btn>
          </div>

          <div className="rte-wrap">
            <div
              ref={edRef}
              className="rte-area"
              style={{ minHeight }}
              data-ph={placeholder}
              contentEditable
              suppressContentEditableWarning
              onInput={sync}
              onBlur={sync}
              spellCheck={false}
            />
          </div>

          <div style={{ display: 'flex', gap: 8, marginTop: 10, flexWrap: 'wrap' }}>
            <button type="button" className="mini-btn" onClick={() => { setPending('inline'); setPicker(true); }}>
              🖼 Вставить фото
            </button>
            <button
              type="button"
              className="mini-btn"
              onClick={() => { setPending('left'); setPicker(true); }}
              title="Фотография слева, текст справа. На узком экране текст перейдёт под фото."
            >
              🖼▸ Фото и текст
            </button>
            <button
              type="button"
              className="mini-btn"
              onClick={() => { setPending('right'); setPicker(true); }}
              title="Текст слева, фотография справа. На узком экране текст перейдёт под фото."
            >
              ◂🖼 Текст и фото
            </button>
            <label className="mini-btn" style={{ cursor: 'pointer' }}>
              {busy ? '⏳ Загрузка…' : '⬆️ Загрузить фото'}
              <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={upload} />
            </label>
            <button
              type="button"
              className="mini-btn"
              onClick={() => {
                if (!confirm('Очистить всё содержимое блока?')) return;
                if (edRef.current) edRef.current.innerHTML = '';
                sync();
              }}
            >
              🗑 Очистить
            </button>
          </div>

          <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 8, lineHeight: 1.55 }}>
            <b>Фото и текст</b> / <b>Текст и фото</b> — готовый адаптивный блок: на широком экране текст
            стоит рядом с фотографией, на узком (телефон) сам переезжает под неё.
          </div>

          {picker && (
            <div className="a-card" style={{ marginTop: 12, maxHeight: 280, overflowY: 'auto' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                <b style={{ fontSize: 14 }}>
                  {pending && pending !== 'inline'
                    ? 'Выберите фото для блока «фото + текст»'
                    : 'Выберите фото для вставки'}
                </b>
                <button type="button" className="mini-btn red" onClick={() => { setPicker(false); setPending(null); }}>
                  ✕
                </button>
              </div>
              {images.length === 0 ? (
                <p style={{ fontSize: 13, color: 'var(--muted)' }}>
                  Фотографий пока нет. Загрузите первую кнопкой «⬆️ Загрузить фото».
                </p>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(96px,1fr))', gap: 10 }}>
                  {images.map((f) => (
                    <button
                      key={f.id}
                      type="button"
                      className="mini-btn"
                      style={{ padding: 4, display: 'block' }}
                      onClick={() => insertImage(f.url, f.original_name)}
                      title={`Вставить «${f.original_name}»`}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={f.url}
                        alt={f.original_name}
                        style={{ width: '100%', height: 64, objectFit: 'cover', borderRadius: 6 }}
                      />
                      <div style={{ fontSize: 10.5, marginTop: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {f.original_name}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </>
      ) : (
        <>
          <textarea
            className="json"
            rows={16}
            value={code}
            onChange={(e) => {
              setCode(e.target.value);
              lastEmitted.current = e.target.value;
              onChange(e.target.value);
            }}
            placeholder="<p>Текст с HTML-разметкой</p>"
          />
          <div style={{ fontSize: 12, color: 'var(--muted2)', marginTop: 6 }}>
            Разметка HTML. Переключитесь на «✏️ Визуально», чтобы увидеть результат.
          </div>
        </>
      )}
    </div>
  );
}
