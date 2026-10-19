'use client';
import { useEffect, useRef, useState } from 'react';

interface UploadFile {
  filename: string;
  original_name: string;
  mime_type: string;
  size_bytes: number;
  url: string;
}

/**
 * Reusable image picker for the admin panel: shows the current image,
 * lets you upload a new one or pick an existing one from the media library.
 * Stored value is a URL string ('' = nothing selected).
 */
export default function ImagePicker({
  value,
  onChange,
  label = 'Картинка',
  hint,
}: {
  value: string;
  onChange: (url: string) => void;
  label?: string;
  hint?: string;
}) {
  const [files, setFiles] = useState<UploadFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [open, setOpen] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/uploads');
      const data = await res.json();
      if (data.files) setFiles(data.files);
    } catch {
      // ignore — library simply stays empty
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) load();
  }, [open]);

  const images = files.filter((f) => f.mime_type.startsWith('image/'));

  const upload = async (file: File) => {
    setUploading(true);
    setErr(null);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch('/api/uploads', { method: 'POST', body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Не удалось загрузить файл');
      onChange(data.file?.url || '');
      await load();
    } catch (ex) {
      setErr(ex instanceof Error ? ex.message : String(ex));
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  return (
    <div className="field">
      <label>{label}</label>

      <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
        <div
          style={{
            width: 120,
            height: 72,
            border: '1px solid var(--line)',
            borderRadius: 10,
            background: 'rgba(255,255,255,.03)',
            display: 'grid',
            placeItems: 'center',
            overflow: 'hidden',
            flexShrink: 0,
          }}
        >
          {value ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={value}
              alt=""
              style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
            />
          ) : (
            <span style={{ fontSize: 12, color: 'var(--muted2)' }}>не выбрана</span>
          )}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <button type="button" className="mini-btn" onClick={() => setOpen(true)}>
            🖼️ Выбрать из медиатеки
          </button>
          <button
            type="button"
            className="mini-btn"
            disabled={uploading}
            onClick={() => inputRef.current?.click()}
          >
            {uploading ? '⏳ Загрузка…' : '⬆ Загрузить файл'}
          </button>
          {value && (
            <button type="button" className="mini-btn red" onClick={() => onChange('')}>
              ✕ Убрать картинку
            </button>
          )}
        </div>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) upload(f);
        }}
      />

      {value && (
        <div style={{ fontSize: 12, color: 'var(--muted2)', marginTop: 6, wordBreak: 'break-all' }}>
          {value}
        </div>
      )}
      {hint && (
        <div style={{ fontSize: 12, color: 'var(--muted2)', marginTop: 6 }}>{hint}</div>
      )}
      {err && (
        <div style={{ fontSize: 12.5, color: '#e8635f', marginTop: 6 }}>{err}</div>
      )}

      {open && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,.7)',
            display: 'grid',
            placeItems: 'center',
            zIndex: 100,
            padding: 20,
          }}
          onClick={() => setOpen(false)}
        >
          <div
            className="a-card"
            style={{ width: '100%', maxWidth: 720, maxHeight: '85vh', overflowY: 'auto' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 14,
              }}
            >
              <h3 style={{ margin: 0, fontSize: 17 }}>Выберите картинку</h3>
              <button type="button" className="mini-btn red" onClick={() => setOpen(false)}>
                ✕
              </button>
            </div>

            {loading ? (
              <p style={{ color: 'var(--muted)' }}>Загрузка списка…</p>
            ) : images.length === 0 ? (
              <p style={{ color: 'var(--muted)' }}>
                В медиатеке пока нет картинок. Загрузите файл кнопкой «⬆ Загрузить файл».
              </p>
            ) : (
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
                  gap: 10,
                }}
              >
                {images.map((f) => (
                  <button
                    key={f.filename}
                    type="button"
                    className="mini-btn"
                    style={{
                      padding: 6,
                      height: 96,
                      display: 'grid',
                      placeItems: 'center',
                      borderColor: value === f.url ? 'var(--acc)' : undefined,
                    }}
                    title={f.original_name}
                    onClick={() => {
                      onChange(f.url);
                      setOpen(false);
                    }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={f.url}
                      alt={f.original_name}
                      style={{ maxWidth: '100%', maxHeight: 78, objectFit: 'contain' }}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
