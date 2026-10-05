'use client';
import { useEffect, useRef, useState } from 'react';
import type { UploadedFile } from '@/lib/types';

const STARTER = `<div class="prod-detail">
  <p>Опишите товар подробнее: характеристики, комплектацию, условия поставки.</p>
  <img src="/img-2.jpg" alt="Фото товара" style="max-width:100%;border-radius:12px" />
  <ul>
    <li>первый пункт</li>
    <li>второй пункт</li>
  </ul>
</div>`;

function fileMeta(name: string, mime?: string) {
  const ext = (name.split('.').pop() || '').toLowerCase();
  const isImage = (mime && mime.startsWith('image/')) || ['jpg', 'jpeg', 'png', 'webp', 'svg', 'gif'].includes(ext);
  return { isImage };
}

/**
 * HTML editor with live preview and image insertion from the server media library.
 * Used for the editable block inside the product popup.
 */
export default function HtmlBlockEditor({
  value,
  onChange,
  label = 'Подробное описание (HTML)',
  hint,
}: {
  value: string;
  onChange: (html: string) => void;
  label?: string;
  hint?: string;
}) {
  const [tab, setTab] = useState<'code' | 'preview'>('code');
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

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
    setUploading(true);
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
      if (inputRef.current) inputRef.current.value = '';
      if (data.file?.url) insert(data.file.url, data.file.original_name ?? file.name);
    } catch (ex) {
      setMsg(ex instanceof Error ? ex.message : String(ex));
    } finally {
      setUploading(false);
    }
  };

  const insert = (url: string, alt: string) => {
    const safeAlt = String(alt).replace(/"/g, '');
    const snippet = `\n<img src="${url}" alt="${safeAlt}" style="max-width:100%;height:auto;border-radius:12px;margin:10px 0" />\n`;
    onChange(value ? `${value}${snippet}` : snippet);
    setPickerOpen(false);
  };

  return (
    <div className="field">
      <label>{label}</label>
      {hint && (
        <div style={{ fontSize: 12.5, color: 'var(--muted)', marginBottom: 8 }}>{hint}</div>
      )}

      <div className="a-tabs" style={{ marginBottom: 10 }}>
        <button type="button" className={tab === 'code' ? 'on' : ''} onClick={() => setTab('code')}>
          ✏️ Код
        </button>
        <button type="button" className={tab === 'preview' ? 'on' : ''} onClick={() => setTab('preview')}>
          👁 Предпросмотр
        </button>
        <span style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
          <button
            type="button"
            className="mini-btn"
            onClick={() => setPickerOpen((v) => !v)}
            title="Вставить фото с сервера"
          >
            🖼 Вставить фото
          </button>
          <label className="mini-btn" style={{ cursor: 'pointer' }} title="Загрузить новое фото">
            {uploading ? '⏳ Загрузка…' : '⬆️ Загрузить фото'}
            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={upload}
            />
          </label>
          <button
            type="button"
            className="mini-btn"
            onClick={() => onChange(value ? value : STARTER)}
            title="Вставить готовый шаблон"
          >
            📋 Шаблон
          </button>
        </span>
      </div>

      {msg && <div className="alert ok" style={{ marginBottom: 10 }}>{msg}</div>}

      {pickerOpen && (
        <div className="a-card" style={{ marginBottom: 12, maxHeight: 260, overflowY: 'auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <b style={{ fontSize: 14 }}>Выберите фото для вставки</b>
            <button type="button" className="mini-btn red" onClick={() => setPickerOpen(false)}>✕</button>
          </div>
          {files.filter((f) => fileMeta(f.original_name, f.mime_type).isImage).length === 0 ? (
            <p style={{ fontSize: 13, color: 'var(--muted)' }}>
              Фотографий пока нет. Загрузите первую кнопкой «⬆️ Загрузить фото».
            </p>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(96px,1fr))', gap: 10 }}>
              {files
                .filter((f) => fileMeta(f.original_name, f.mime_type).isImage)
                .map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    className="mini-btn"
                    style={{ padding: 4, display: 'block' }}
                    onClick={() => insert(f.url, f.original_name)}
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

      {tab === 'code' ? (
        <textarea
          rows={14}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="<p>Текст с HTML-разметкой</p>"
          style={{ fontFamily: 'ui-monospace, Menlo, Consolas, monospace', fontSize: 13 }}
        />
      ) : (
        <div
          className="a-card"
          style={{ minHeight: 160, padding: 16 }}
          dangerouslySetInnerHTML={{
            __html: value?.trim()
              ? value
              : '<p style="color:var(--muted)">Пока пусто. Переключитесь на «✏️ Код» и добавьте содержимое.</p>',
          }}
        />
      )}

      <div style={{ fontSize: 12, color: 'var(--muted2)', marginTop: 6 }}>
        Можно использовать теги: &lt;p&gt;, &lt;b&gt;, &lt;ul&gt;&lt;li&gt;, &lt;img&gt;, &lt;table&gt;, &lt;a&gt; и другие.
      </div>
    </div>
  );
}
