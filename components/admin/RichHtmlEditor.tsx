'use client';
import { useEffect, useRef, useState } from 'react';
import type { UploadedFile } from '@/lib/types';

const SIZES = [
  { v: '2', label: 'A−', title: 'Маленький текст' },
  { v: '3', label: 'A', title: 'Обычный текст' },
  { v: '5', label: 'A+', title: 'Крупный текст' },
  { v: '6', label: 'A++', title: 'Заголовок' },
];

const COLORS = ['#ffffff', '#22d3ee', '#f59e0b', '#ef4444', '#22c55e', '#a78bfa'];

function isImage(name: string, mime?: string) {
  const ext = (name.split('.').pop() || '').toLowerCase();
  return (mime && mime.startsWith('image/')) || ['jpg', 'jpeg', 'png', 'webp', 'svg', 'gif'].includes(ext);
}

/**
 * Visual (WYSIWYG) editor for the product popup content.
 * Toolbar works on the current selection; «Код» tab shows raw HTML for advanced editing.
 */
export default function RichHtmlEditor({
  value,
  onChange,
  label = 'Подробное описание',
  hint,
}: {
  value: string;
  onChange: (html: string) => void;
  label?: string;
  hint?: string;
}) {
  const edRef = useRef<HTMLDivElement>(null);
  const loaded = useRef(false);
  const [mode, setMode] = useState<'visual' | 'code'>('visual');
  const [code, setCode] = useState(value ?? '');
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [picker, setPicker] = useState(false);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  // load the stored HTML into the editable area once
  useEffect(() => {
    if (loaded.current) return;
    if (edRef.current) edRef.current.innerHTML = value ?? '';
    loaded.current = true;
    setCode(value ?? '');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const sync = () => {
    const html = edRef.current?.innerHTML ?? '';
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
    insertHtml(
      `\n<img src="${url}" alt="${String(alt).replace(/"/g, '')}" style="max-width:100%;height:auto;border-radius:12px;margin:10px 0" />\n`
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
        html += r === 0 ? '<th style="border:1px solid #2a3a52;padding:8px">Заголовок</th>' : '<td style="border:1px solid #2a3a52;padding:8px">&nbsp;</td>';
      }
      html += '</tr>';
    }
    html += '</tbody></table><p></p>';
    insertHtml(html);
  };

  const switchTo = (m: 'visual' | 'code') => {
    if (m === mode) return;
    if (m === 'visual') {
      // push the hand-edited code into the visual area
      if (edRef.current) edRef.current.innerHTML = code;
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
    active,
  }: {
    title: string;
    onClick: () => void;
    children: React.ReactNode;
    active?: boolean;
  }) => (
    <button
      type="button"
      className={`rte-btn${active ? ' on' : ''}`}
      title={title}
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
    >
      {children}
    </button>
  );

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
            <Btn title="Выровнять по ширине" onClick={() => exec('justifyFull')}><span style={{ transform: 'scaleX(1.3)', display: 'inline-block' }}>≡</span></Btn>
            <span className="rte-sep" />
            <Btn title="Маркированный список" onClick={() => exec('insertUnorderedList')}>•—</Btn>
            <Btn title="Нумерованный список" onClick={() => exec('insertOrderedList')}>1.</Btn>
            <Btn title="Цитата" onClick={() => exec('formatBlock', 'blockquote')}>❝</Btn>
            <Btn title="Разделительная линия" onClick={() => insertHtml('<hr />')}>—</Btn>
            <span className="rte-sep" />
            <Btn title="Цвет текста" onClick={() => exec('foreColor', '#22d3ee')}>
              <span style={{ color: '#22d3ee' }}>●</span>
            </Btn>
            {COLORS.map((c) => (
              <Btn key={c} title={`Цвет: ${c}`} onClick={() => exec('foreColor', c)}>
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
              contentEditable
              suppressContentEditableWarning
              onInput={sync}
              onBlur={sync}
              spellCheck={false}
            />
          </div>

          <div style={{ display: 'flex', gap: 8, marginTop: 10, flexWrap: 'wrap' }}>
            <button type="button" className="mini-btn" onClick={() => setPicker((v) => !v)}>
              🖼 Вставить фото
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

          {picker && (
            <div className="a-card" style={{ marginTop: 12, maxHeight: 280, overflowY: 'auto' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                <b style={{ fontSize: 14 }}>Выберите фото для вставки</b>
                <button type="button" className="mini-btn red" onClick={() => setPicker(false)}>✕</button>
              </div>
              {files.filter((f) => isImage(f.original_name, f.mime_type)).length === 0 ? (
                <p style={{ fontSize: 13, color: 'var(--muted)' }}>
                  Фотографий пока нет. Загрузите первую кнопкой «⬆️ Загрузить фото».
                </p>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(96px,1fr))', gap: 10 }}>
                  {files
                    .filter((f) => isImage(f.original_name, f.mime_type))
                    .map((f) => (
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
              onChange(e.target.value);
            }}
          />
          <div style={{ fontSize: 12, color: 'var(--muted2)', marginTop: 6 }}>
            Разметка HTML. Переключитесь на «✏️ Визуально», чтобы увидеть результат.
          </div>
        </>
      )}
    </div>
  );
}
