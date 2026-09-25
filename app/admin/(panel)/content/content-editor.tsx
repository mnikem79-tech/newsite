'use client';
import { useRouter } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import type { PageSection, UploadedFile } from '@/lib/types';
import { getDefaultSections } from '@/lib/default-sections';

const PAGES = [
  { id: 'home', title: '🏠 Главная' },
  { id: 'about', title: '🏢 О компании' },
  { id: 'catalog', title: '📦 Каталог' },
  { id: 'production', title: '🏭 Производство' },
  { id: 'services', title: '⚙️ Услуги' },
  { id: 'materials', title: '📄 Материалы' },
  { id: 'contacts', title: '📞 Контакты' },
  { id: 'cart', title: '🛒 Корзина' },
  { id: 'checkout', title: '💳 Оформление' },
];

export function getFileMeta(name: string, mime?: string) {
  const ext = (name.split('.').pop() || '').toLowerCase();
  const isImage = (mime && mime.startsWith('image/')) || ['jpg', 'jpeg', 'png', 'webp', 'svg', 'gif'].includes(ext);
  let icon = '📎';
  let typeLabel = 'Файл';
  if (isImage) {
    icon = '🖼️';
    typeLabel = 'Изображение';
  } else if (ext === 'pdf') {
    icon = '📕';
    typeLabel = 'PDF документ';
  } else if (['doc', 'docx', 'rtf', 'odt'].includes(ext)) {
    icon = '📘';
    typeLabel = 'Word документ';
  } else if (['xls', 'xlsx', 'csv', 'ods'].includes(ext)) {
    icon = '📊';
    typeLabel = 'Таблица Excel';
  } else if (['txt', 'md'].includes(ext)) {
    icon = '📄';
    typeLabel = 'Текстовый файл';
  } else if (['zip', 'rar', '7z', 'tar', 'gz'].includes(ext)) {
    icon = '📦';
    typeLabel = 'Архив файлов';
  } else if (['dwg', 'dxf'].includes(ext)) {
    icon = '📐';
    typeLabel = 'Чертёж CAD';
  }
  return { ext: ext.toUpperCase(), isImage, icon, typeLabel };
}

const TEMPLATES: { label: string; desc: string; htmlRu: string }[] = [
  {
    label: '⚡ Главный экран (Hero с фоном и цифрами)',
    desc: 'Главный экран сайта: фоновая картинка, заголовок с градиентом, кнопки и 3 блока показателей',
    htmlRu: `<div class="hero align-top" style="min-height: 540px;">
  <div class="bgimg" style="background-image: url('/img-2.jpg');"></div>
  <div class="wrap" style="padding-top: 36px; padding-bottom: 50px;">
    <div class="kicker">⚡ Научно-производственное объединение</div>
    <h1>Компенсация реактивной мощности <span>и надёжное энергооборудование</span></h1>
    <p>Изготавливаем и поставляем энергетическое оборудование от 230 В до 220 кВ, импортируем продукцию из дружественных стран и оказываем инженерные услуги — от расчётов до пусконаладки.</p>
    <div class="cta">
      <a href="/catalog" class="btn primary"><span>Смотреть каталог</span> →</a>
      <a href="/contacts" class="btn ghost">Оставить заявку</a>
    </div>
    <div class="stats">
      <div class="stat"><div class="n">230 <b>В</b> – <b>220</b> <b>кВ</b></div><div class="l">Диапазон напряжений конденсаторных установок</div></div>
      <div class="stat"><div class="n">9</div><div class="l">Разделов каталога продукции</div></div>
      <div class="stat"><div class="n">5+</div><div class="l">Видов инженерных услуг</div></div>
    </div>
  </div>
</div>`,
  },
  {
    label: '🧭 Блок навигации (Заголовок страницы)',
    desc: 'Хлебные крошки, бейдж, крупный заголовок и подзаголовок страницы',
    htmlRu: `<div class="pagehead">
  <div class="wrap">
    <div class="crumb"><a href="/">Главная</a> / <span>Название страницы</span></div>
    <div class="kick">Раздел</div>
    <h1>Заголовок страницы</h1>
    <p>Краткое описание назначения страницы или раздела сайта.</p>
  </div>
</div>`,
  },
  {
    label: '📱 2 колонки: Текст + Фото',
    desc: 'На компьютере в 2 колонки, на телефоне автоматически выстраивается в одну',
    htmlRu: `<div class="two">
  <div>
    <div class="badge">Новый раздел</div>
    <h2 class="sec">Заголовок раздела</h2>
    <p class="lead" style="margin-top: 16px;">
      Введите подробный текст описания здесь. Этот блок автоматически адаптируется под любой экран мобильного телефона или компьютера.
    </p>
    <div class="feat-list" style="margin-top: 20px;">
      <div class="feat"><div class="chk">✓</div><p>Первое ключевое преимущество</p></div>
      <div class="feat"><div class="chk">✓</div><p>Второе ключевое преимущество</p></div>
      <div class="feat"><div class="chk">✓</div><p>Высокая надёжность и качество</p></div>
    </div>
  </div>
  <div class="figure">
    <img src="/img-3.jpg" alt="Фото" />
    <div class="cap">Подпись к фотографии</div>
  </div>
</div>`,
  },
  {
    label: '🃏 Сетка из 3 карточек',
    desc: 'Красивые карточки с иконками, на телефоне выстраиваются вертикально',
    htmlRu: `<div class="shead">
  <div>
    <div class="kick">Преимущества</div>
    <h2 class="sec">Наши решения</h2>
  </div>
</div>
<div class="grid g3">
  <div class="card">
    <div class="chd"><div class="ic">⚡</div><h3>Решение 1</h3></div>
    <p>Описание первого решения или оборудования. Текст карточки адаптируется под экраны.</p>
  </div>
  <div class="card">
    <div class="chd"><div class="ic">🛡️</div><h3>Решение 2</h3></div>
    <p>Описание второго решения или оборудования. Высокая надёжность и долговечность.</p>
  </div>
  <div class="card">
    <div class="chd"><div class="ic">⚙️</div><h3>Решение 3</h3></div>
    <p>Описание третьего решения. Гарантийное и сервисное обслуживание на объектах.</p>
  </div>
</div>`,
  },
  {
    label: '📄 Блок скачивания документов',
    desc: 'Карточки прикреплённых документов с кнопками скачивания',
    htmlRu: `<div class="shead">
  <div>
    <div class="kick">Документация</div>
    <h2 class="sec">Файлы для скачивания</h2>
  </div>
</div>
<div class="card doc-card">
  <div class="chd">
    <div class="ic">📘</div>
    <div>
      <h3>Опросный лист и техническое задание</h3>
      <p style="margin: 0; font-size: 13px; color: var(--muted2);">DOCX документ · Нажмите для скачивания</p>
    </div>
  </div>
  <a href="/contacts" class="btn primary">Скачать форму ↓</a>
</div>`,
  },
  {
    label: '📣 Баннер с призывом (CTA)',
    desc: 'Яркая полоса с заголовком и кнопкой перехода',
    htmlRu: `<div class="cta-strip">
  <div>
    <h3>Остались вопросы или требуется расчёт?</h3>
    <p>Свяжитесь с нашими инженерами для подбора оборудования под требования вашего объекта.</p>
  </div>
  <a href="/contacts" class="btn primary">Получить консультацию →</a>
</div>`,
  },
  {
    label: '💻 Свободный HTML-блок',
    desc: 'Пустой раздел для любого вашего HTML-кода',
    htmlRu: `<div>
  <h2>Заголовок</h2>
  <p>Произвольный текст или HTML-код.</p>
</div>`,
  },
];

interface Props {
  initial: {
    home_hero: Record<string, string> | null;
    about_intro: Record<string, string> | null;
    contacts: Record<string, string> | null;
    site: Record<string, string> | null;
    materials: unknown[] | null;
    services: unknown[] | null;
    sections: Record<string, PageSection[]>;
  };
}

export default function ContentEditor({ initial }: Props) {
  const router = useRouter();

  // Top navigation mode: 'builder' | 'media' | 'site' | 'other'
  const [mainMode, setMainMode] = useState<'builder' | 'media' | 'site' | 'other'>('builder');

  // Page builder states
  const [page, setPage] = useState('home');
  const [sectionsByPage, setSectionsByPage] = useState<Record<string, PageSection[]>>(initial.sections);
  const [activeSecId, setActiveSecId] = useState<string | null>(
    initial.sections.home?.[0]?.id ?? null
  );

  // Template modal
  const [showTemplateModal, setShowTemplateModal] = useState(false);

  // Device switcher for preview: 'desktop' | 'tablet' | 'mobile'
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');

  // Media Library states
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [mediaFilter, setMediaFilter] = useState<'all' | 'images' | 'docs'>('all');
  const [loadingFiles, setLoadingFiles] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [showFilePicker, setShowFilePicker] = useState(false);
  const [pickerTab, setPickerTab] = useState<'all' | 'images' | 'docs'>('all');
  const [pickerMode, setPickerMode] = useState<'insert' | 'background'>('insert');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Legacy & global states
  const [contacts, setContacts] = useState(initial.contacts);
  const [site, setSite] = useState(initial.site);
  const [materialsJson, setMaterialsJson] = useState(JSON.stringify(initial.materials, null, 2));
  const [servicesJson, setServicesJson] = useState(JSON.stringify(initial.services, null, 2));

  // Status
  const [err, setErr] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  // Current page sections
  const currentSections = sectionsByPage[page] || [];
  const activeSection = currentSections.find((s) => s.id === activeSecId) || currentSections[0] || null;

  // Load uploaded files
  const loadFiles = async () => {
    setLoadingFiles(true);
    try {
      const res = await fetch('/api/uploads');
      const data = await res.json();
      if (data.files) setFiles(data.files);
    } catch {
      // ignore
    } finally {
      setLoadingFiles(false);
    }
  };

  useEffect(() => {
    loadFiles();
  }, []);

  // Upload handler (accepts documents, spreadsheets, images, archives)
  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setErr(null);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch('/api/uploads', {
        method: 'POST',
        body: fd,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Ошибка загрузки');
      setOk(`Файл «${file.name}» успешно загружен в папку на сервере!`);
      setTimeout(() => setOk(null), 3500);
      await loadFiles();
      if (fileInputRef.current) fileInputRef.current.value = '';

      if (showFilePicker && pickerMode === 'background' && data.file?.url) {
        updateBackgroundImage(data.file.url);
      }
    } catch (ex) {
      setErr(ex instanceof Error ? ex.message : String(ex));
    } finally {
      setUploading(false);
    }
  };

  const deleteFile = async (filename: string, originalName: string) => {
    if (!confirm(`Удалить файл «${originalName}» с сервера?`)) return;
    try {
      const res = await fetch(`/api/uploads/${encodeURIComponent(filename)}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Не удалось удалить файл');
      setFiles((prev) => prev.filter((f) => f.filename !== filename));
      setOk('Файл удалён');
      setTimeout(() => setOk(null), 2500);
    } catch (ex) {
      alert(ex instanceof Error ? ex.message : String(ex));
    }
  };

  // Section manipulation functions
  const updateActiveSection = (updater: (prev: PageSection) => PageSection) => {
    if (!activeSection) return;
    setSectionsByPage((prev) => {
      const list = prev[page] || [];
      return {
        ...prev,
        [page]: list.map((s) => (s.id === activeSection.id ? updater(s) : s)),
      };
    });
  };

  const moveSection = (index: number, direction: 'up' | 'down') => {
    const list = [...currentSections];
    const target = direction === 'up' ? index - 1 : index + 1;
    if (target < 0 || target >= list.length) return;
    const temp = list[index];
    list[index] = list[target];
    list[target] = temp;
    setSectionsByPage((prev) => ({ ...prev, [page]: list }));
  };

  const toggleSectionActive = (id: string) => {
    setSectionsByPage((prev) => {
      const list = prev[page] || [];
      return {
        ...prev,
        [page]: list.map((s) => (s.id === id ? { ...s, is_active: !s.is_active } : s)),
      };
    });
  };

  const deleteSection = (id: string) => {
    if (!confirm('Вы уверены, что хотите удалить этот раздел?')) return;
    setSectionsByPage((prev) => {
      const list = (prev[page] || []).filter((s) => s.id !== id);
      return { ...prev, [page]: list };
    });
    if (activeSecId === id) {
      const remaining = currentSections.filter((s) => s.id !== id);
      setActiveSecId(remaining[0]?.id || null);
    }
  };

  const addSectionFromTemplate = (templateIndex: number) => {
    const tpl = TEMPLATES[templateIndex];
    const newId = `sec-${page}-${Date.now().toString(36)}`;
    const isNav = tpl.label.includes('Блок навигации');
    const isHero = tpl.label.includes('Hero');
    const isFullWidth = isHero || isNav;
    const newSec: PageSection = {
      id: newId,
      name: tpl.label.replace(/^[^\s]+\s*/, ''),
      type: 'html',
      is_active: true,
      container: isFullWidth ? 'full' : 'wrap',
      padding_top: isNav ? 46 : isFullWidth ? 0 : undefined,
      padding_bottom: isNav ? 26 : isFullWidth ? 0 : undefined,
      html_ru: tpl.htmlRu,
    };
    setSectionsByPage((prev) => ({
      ...prev,
      [page]: [...(prev[page] || []), newSec],
    }));
    setActiveSecId(newId);
    setShowTemplateModal(false);
  };

  const resetToDefaultSections = () => {
    if (!confirm('Сбросить разделы этой страницы к исходным? Все ваши изменения на этой странице будут заменены стандартными блоками.')) return;
    const def = getDefaultSections(page);
    setSectionsByPage((prev) => ({ ...prev, [page]: def }));
    setActiveSecId(def[0]?.id || null);
  };

  // Insert snippet or file into HTML textarea
  const insertHtmlSnippet = (snippet: string) => {
    if (!activeSection) return;
    const current = activeSection.html_ru;
    const updated = current + '\n\n' + snippet;
    updateActiveSection((s) => ({
      ...s,
      html_ru: updated,
    }));
  };

  const insertImageTag = (url: string, name: string) => {
    const tag = `<img src="${url}" alt="${name}" style="max-width: 100%; height: auto; border-radius: 12px; margin: 16px 0;" />`;
    insertHtmlSnippet(tag);
    setShowFilePicker(false);
  };

  const updateBackgroundImage = (imageUrl: string) => {
    if (!activeSection) return;
    const replaceBg = (html: string) => {
      // 1. Strip background-image from the outer .hero tag to avoid dual-layer repeat seam
      let res = html.replace(/(<div[^>]*class="[^"]*hero[^"]*"[^>]*style="[^"]*?)background-image:\s*url\([^)]+\);?\s*/gi, '$1');
      // 2. Update .bgimg background-image
      if (/class="[^"]*bgimg[^"]*"[^>]*style="background-image:\s*url\([^)]+\);?"/i.test(res)) {
        res = res.replace(/(class="[^"]*bgimg[^"]*"[^>]*style="background-image:\s*)url\([^)]+\)/gi, `$1url('${imageUrl}')`);
      } else if (/class="[^"]*bgimg[^"]*"/i.test(res)) {
        res = res.replace(/class="([^"]*bgimg[^"]*)"/i, `class="$1" style="background-image: url('${imageUrl}');"`);
      } else if (/background-image:\s*url\([^)]+\)/i.test(res)) {
        res = res.replace(/background-image:\s*url\([^)]+\)/gi, `background-image: url('${imageUrl}')`);
      } else {
        res = res.replace(/<div\s+([^>]*class="[^"]*hero[^"]*"[^>]*)>/i, `<div $1>\n  <div class="bgimg" style="background-image: url('${imageUrl}');"></div>`);
      }
      return res;
    };
    updateActiveSection((s) => ({
      ...s,
      html_ru: replaceBg(s.html_ru),
    }));
    setShowFilePicker(false);
    setOk('Фоновая картинка обновлена!');
    setTimeout(() => setOk(null), 3000);
  };

  const insertDocDownloadButton = (file: UploadedFile) => {
    const meta = getFileMeta(file.original_name, file.mime_type);
    const tag = `<a href="${file.url}?download=1" class="btn ghost doc-btn" download><span style="font-size: 18px;">${meta.icon}</span> <span>Скачать ${file.original_name} (${(file.size_bytes / 1024).toFixed(0)} КБ) ↓</span></a>`;
    insertHtmlSnippet(tag);
    setShowFilePicker(false);
  };

  const insertDocCard = (file: UploadedFile) => {
    const meta = getFileMeta(file.original_name, file.mime_type);
    const tag = `<div class="card doc-card">
  <div class="chd">
    <div class="ic" style="font-size: 22px;">${meta.icon}</div>
    <div>
      <h3 style="margin: 0; font-size: 16px;">${file.original_name}</h3>
      <p style="margin: 4px 0 0; font-size: 13px; color: var(--muted2);">${meta.typeLabel} · ${(file.size_bytes / 1024).toFixed(0)} КБ</p>
    </div>
  </div>
  <a href="${file.url}?download=1" class="btn primary" download>Скачать файл ↓</a>
</div>`;
    insertHtmlSnippet(tag);
    setShowFilePicker(false);
  };

  // Save current page sections
  const saveSections = async () => {
    setErr(null);
    setOk(null);
    setBusy(true);
    try {
      const key = `sections_${page}`;
      const payload = sectionsByPage[page] || [];
      const res = await fetch(`/api/content/${key}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Ошибка сохранения');
      setOk('Разделы успешно сохранены! Изменения обновятся на сайте в течение ~30 секунд.');
      setTimeout(() => setOk(null), 4000);
      router.refresh();
    } catch (ex) {
      setErr(ex instanceof Error ? ex.message : String(ex));
    } finally {
      setBusy(false);
    }
  };

  // Save site & contacts
  const saveSiteAndContacts = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    setOk(null);
    setBusy(true);
    try {
      await Promise.all([
        fetch('/api/content/site', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(site),
        }),
        fetch('/api/content/contacts', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(contacts),
        }),
      ]);
      setOk('Настройки шапки, подвала и контактов сохранены!');
      setTimeout(() => setOk(null), 4000);
      router.refresh();
    } catch (ex) {
      setErr(ex instanceof Error ? ex.message : String(ex));
    } finally {
      setBusy(false);
    }
  };

  // Save JSON
  const saveJson = async (targetTab: 'materials' | 'services') => {
    setErr(null);
    setOk(null);
    setBusy(true);
    try {
      const raw = targetTab === 'materials' ? materialsJson : servicesJson;
      const parsed = JSON.parse(raw);
      const res = await fetch(`/api/content/${targetTab}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(parsed),
      });
      if (!res.ok) throw new Error('Ошибка сохранения JSON');
      setOk('Справочник сохранен!');
      setTimeout(() => setOk(null), 4000);
      router.refresh();
    } catch {
      setErr('Некорректный JSON: проверьте синтаксис');
    } finally {
      setBusy(false);
    }
  };

  // Filtered files
  const filteredFiles = files.filter((f) => {
    const meta = getFileMeta(f.original_name, f.mime_type);
    if (mainMode === 'media' && mediaFilter === 'images') return meta.isImage;
    if (mainMode === 'media' && mediaFilter === 'docs') return !meta.isImage;
    return true;
  });

  const pickerFilteredFiles = files.filter((f) => {
    const meta = getFileMeta(f.original_name, f.mime_type);
    if (pickerTab === 'images') return meta.isImage;
    if (pickerTab === 'docs') return !meta.isImage;
    return true;
  });

  return (
    <div className="builder-shell">
      {/* Global hidden file input for uploading from constructor, media tab, or modal */}
      <input
        ref={fileInputRef}
        type="file"
        style={{ display: 'none' }}
        onChange={handleUpload}
      />

      {/* Top Navigation Tabs */}
      <div className="a-tabs" style={{ marginBottom: 14 }}>
        <button
          className={mainMode === 'builder' ? 'on' : ''}
          onClick={() => { setMainMode('builder'); setErr(null); setOk(null); }}
        >
          🏗️ Конструктор страниц
        </button>
        <button
          className={mainMode === 'media' ? 'on' : ''}
          onClick={() => { setMainMode('media'); setErr(null); setOk(null); loadFiles(); }}
        >
          📁 Файлы и документы {files.length > 0 && `(${files.length})`}
        </button>
        <button
          className={mainMode === 'site' ? 'on' : ''}
          onClick={() => { setMainMode('site'); setErr(null); setOk(null); }}
        >
          ⚙️ Шапка, подвал и контакты
        </button>
        <button
          className={mainMode === 'other' ? 'on' : ''}
          onClick={() => { setMainMode('other'); setErr(null); setOk(null); }}
        >
          📋 Справочники (JSON)
        </button>
      </div>

      {err && <div className="alert err">{err}</div>}
      {ok && <div className="alert ok">{ok}</div>}

      {/* ========================================================
          MODE 1: PAGE BUILDER
          ======================================================== */}
      {mainMode === 'builder' && (
        <>
          {/* Select Page */}
          <div className="builder-page-select">
            <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--muted2)', marginRight: 6 }}>Страница:</span>
            {PAGES.map((p) => (
              <button
                key={p.id}
                className={`builder-page-btn ${page === p.id ? 'active' : ''}`}
                onClick={() => {
                  setPage(p.id);
                  setActiveSecId(sectionsByPage[p.id]?.[0]?.id || null);
                  setErr(null);
                  setOk(null);
                }}
              >
                {p.title}
              </button>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: 20, alignItems: 'start' }}>
            {/* Left Column: Sections List */}
            <div className="a-card" style={{ padding: 18 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                <h3 style={{ margin: 0, fontSize: 15 }}>Разделы ({currentSections.length})</h3>
                <button
                  className="mini-btn"
                  style={{ background: 'rgba(37,195,214,.12)', color: 'var(--acc)', borderColor: 'var(--acc)' }}
                  onClick={() => setShowTemplateModal(true)}
                >
                  + Добавить
                </button>
              </div>

              <div className="section-list">
                {currentSections.map((sec, idx) => {
                  const isCurrent = sec.id === activeSection?.id;
                  return (
                    <div
                      key={sec.id}
                      className={`section-item ${isCurrent ? 'active' : ''} ${!sec.is_active ? 'inactive' : ''}`}
                      style={{ cursor: 'pointer', padding: '12px 14px' }}
                      onClick={() => setActiveSecId(sec.id)}
                    >
                      <div className="section-item-left">
                        <div className="section-order-btns" onClick={(e) => e.stopPropagation()}>
                          <button
                            className="section-order-btn"
                            disabled={idx === 0}
                            title="Поднять вверх"
                            onClick={() => moveSection(idx, 'up')}
                          >
                            ▲
                          </button>
                          <button
                            className="section-order-btn"
                            disabled={idx === currentSections.length - 1}
                            title="Опустить вниз"
                            onClick={() => moveSection(idx, 'down')}
                          >
                            ▼
                          </button>
                        </div>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                            <span className="section-badge-type">
                              {sec.type === 'html' ? 'HTML' : 'БЛОК'}
                            </span>
                            {!sec.is_active && (
                              <span style={{ fontSize: 11, color: 'var(--red)', fontWeight: 700 }}>Скрыт</span>
                            )}
                          </div>
                          <div className="section-title-txt" style={{ fontSize: 14 }}>
                            {sec.name || `Раздел ${idx + 1}`}
                          </div>
                        </div>
                      </div>

                      <div className="section-actions" onClick={(e) => e.stopPropagation()}>
                        <button
                          className="mini-btn"
                          style={{ padding: '4px 8px' }}
                          title={sec.is_active ? 'Скрыть раздел' : 'Показать раздел'}
                          onClick={() => toggleSectionActive(sec.id)}
                        >
                          {sec.is_active ? '👁️' : '🚫'}
                        </button>
                        <button
                          className="mini-btn red"
                          style={{ padding: '4px 8px' }}
                          title="Удалить раздел"
                          onClick={() => deleteSection(sec.id)}
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div style={{ marginTop: 20, paddingTop: 16, borderTop: '1px solid var(--line)' }}>
                <button
                  className="mini-btn"
                  style={{ width: '100%', textAlign: 'center', color: 'var(--muted2)' }}
                  onClick={resetToDefaultSections}
                >
                  ↺ Сбросить к исходным блокам
                </button>
              </div>
            </div>

            {/* Right Column: Section Editor */}
            <div className="a-card">
              {activeSection ? (
                <>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
                    <div>
                      <h3 style={{ margin: 0, fontSize: 18 }}>Редактирование раздела: {activeSection.name}</h3>
                      <div style={{ fontSize: 13, color: 'var(--muted2)', marginTop: 4 }}>
                        Тип блока: <b>{activeSection.type === 'html' || activeSection.type === 'hero' ? 'Настраиваемый HTML' : 'Системный блок'}</b>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 10 }}>
                      <button className="btn primary" onClick={saveSections} disabled={busy}>
                        {busy ? '…' : '💾 Сохранить изменения страницы'}
                      </button>
                    </div>
                  </div>

                  <div className="frow" style={{ marginBottom: 16 }}>
                    <div className="field">
                      <label>Название раздела</label>
                      <input
                        value={activeSection.name}
                        onChange={(e) => updateActiveSection((s) => ({ ...s, name: e.target.value }))}
                      />
                    </div>
                    <div className="field">
                      <label>Ширина контейнера</label>
                      <select
                        value={activeSection.container || 'wrap'}
                        onChange={(e) => updateActiveSection((s) => ({ ...s, container: e.target.value as 'wrap' | 'full' | 'narrow' }))}
                      >
                        <option value="wrap">Стандартная ширина (1200px)</option>
                        <option value="narrow">Узкая колонка (860px)</option>
                        <option value="full">На всю ширину экрана (100%)</option>
                      </select>
                    </div>
                  </div>
                  <div className="frow" style={{ marginBottom: 16 }}>
                    <div className="field">
                      <label>Цвет фона раздела</label>
                      <select
                        value={activeSection.bg || 'default'}
                        onChange={(e) => updateActiveSection((s) => ({ ...s, bg: e.target.value as 'default' | 'panel' | 'dark' }))}
                      >
                        <option value="default">Основной фон сайта</option>
                        <option value="panel">Панель (светлее)</option>
                        <option value="dark">Тёмно-синий глубокий (#081020)</option>
                      </select>
                    </div>
                    <div className="field">
                      <label>Отступы / расстояние до соседних блоков</label>
                      <select
                        value={
                          activeSection.padding_top === 0 && activeSection.padding_bottom === 0
                            ? 'none'
                            : activeSection.padding_top === 8 && activeSection.padding_bottom === 8
                            ? 'tiny'
                            : activeSection.padding_top === 14 && activeSection.padding_bottom === 14
                            ? 'compact'
                            : activeSection.padding_top === 36 && activeSection.padding_bottom === 36
                            ? 'large'
                            : activeSection.padding_top === 46 && activeSection.padding_bottom === 26
                            ? 'nav_default'
                            : 'normal'
                        }
                        onChange={(e) => {
                          const v = e.target.value;
                          if (v === 'none') updateActiveSection((s) => ({ ...s, padding_top: 0, padding_bottom: 0 }));
                          else if (v === 'tiny') updateActiveSection((s) => ({ ...s, padding_top: 8, padding_bottom: 8 }));
                          else if (v === 'compact') updateActiveSection((s) => ({ ...s, padding_top: 14, padding_bottom: 14 }));
                          else if (v === 'large') updateActiveSection((s) => ({ ...s, padding_top: 36, padding_bottom: 36 }));
                          else if (v === 'nav_default') updateActiveSection((s) => ({ ...s, padding_top: 46, padding_bottom: 26 }));
                          else updateActiveSection((s) => ({ ...s, padding_top: undefined, padding_bottom: undefined }));
                        }}
                      >
                        <option value="normal">Стандартное аккуратное расстояние (~24-30px)</option>
                        <option value="nav_default">Стандарт для блока навигации (46px / 26px)</option>
                        <option value="compact">Компактное расстояние (~14px)</option>
                        <option value="tiny">Очень маленькое (8px)</option>
                        <option value="none">Без отступа (вплотную 0px)</option>
                        <option value="large">Увеличенное расстояние (~50-60px)</option>
                      </select>
                    </div>
                  </div>
                  <div className="frow" style={{ marginBottom: 16 }}>
                    <div className="field">
                      <label>Отступ сверху (px)</label>
                      <input
                        type="number"
                        min="0"
                        max="200"
                        placeholder="По умолчанию (46px)"
                        value={activeSection.padding_top ?? ''}
                        onChange={(e) => {
                          const v = e.target.value.trim();
                          updateActiveSection((s) => ({
                            ...s,
                            padding_top: v === '' ? undefined : Math.max(0, parseInt(v, 10) || 0),
                          }));
                        }}
                      />
                    </div>
                    <div className="field">
                      <label>Отступ снизу (px)</label>
                      <input
                        type="number"
                        min="0"
                        max="200"
                        placeholder="По умолчанию (26px)"
                        value={activeSection.padding_bottom ?? ''}
                        onChange={(e) => {
                          const v = e.target.value.trim();
                          updateActiveSection((s) => ({
                            ...s,
                            padding_bottom: v === '' ? undefined : Math.max(0, parseInt(v, 10) || 0),
                          }));
                        }}
                      />
                    </div>
                  </div>

                  {activeSection.type === 'html' || activeSection.type === 'hero' ? (
                    <>
                      {/* Snippet Toolbar */}
                      <div className="snippet-toolbar">
                        <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--muted2)', marginRight: 4 }}>Вставка:</span>
                        <button
                          type="button"
                          className="snippet-btn"
                          onClick={() => { setPickerTab('images'); setPickerMode('insert'); setShowFilePicker(true); }}
                        >
                          🖼️ Фото
                        </button>
                        <button
                          type="button"
                          className="snippet-btn"
                          onClick={() => { setPickerTab('images'); setPickerMode('background'); setShowFilePicker(true); }}
                        >
                          🌄 Сменить фон (background)
                        </button>
                        <button
                          type="button"
                          className="snippet-btn"
                          style={{ borderColor: 'var(--acc)', color: 'var(--acc)' }}
                          onClick={() => { setPickerTab('docs'); setPickerMode('insert'); setShowFilePicker(true); }}
                        >
                          📎 Файл / Документ (Word, Excel, PDF)
                        </button>
                        <button
                          type="button"
                          className="snippet-btn"
                          onClick={() =>
                            insertHtmlSnippet(
                              `<div class="two">\n  <div>\n    <h3>Заголовок</h3>\n    <p>Текст в левой колонке.</p>\n  </div>\n  <div class="figure">\n    <img src="/img-3.jpg" alt="Фото" />\n  </div>\n</div>`
                            )
                          }
                        >
                          📱 2 колонки (текст + фото)
                        </button>
                        <button
                          type="button"
                          className="snippet-btn"
                          onClick={() =>
                            insertHtmlSnippet(
                              `<div class="grid g3">\n  <div class="card">\n    <div class="chd"><div class="ic">⚡</div><h3>Карточка 1</h3></div>\n    <p>Описание первого пункта. На телефоне выстраивается в один столбец.</p>\n  </div>\n  <div class="card">\n    <div class="chd"><div class="ic">🛡️</div><h3>Карточка 2</h3></div>\n    <p>Описание второго пункта. На телефоне выстраивается в один столбец.</p>\n  </div>\n  <div class="card">\n    <div class="chd"><div class="ic">⚙️</div><h3>Карточка 3</h3></div>\n    <p>Описание третьего пункта. На телефоне выстраивается в один столбец.</p>\n  </div>\n</div>`
                            )
                          }
                        >
                          🃏 3 карточки (с иконками)
                        </button>
                        <button
                          type="button"
                          className="snippet-btn"
                          onClick={() =>
                            insertHtmlSnippet(
                              `<a href="/contacts" class="btn primary">Текст кнопки →</a>`
                            )
                          }
                        >
                          🔘 Кнопка
                        </button>
                        <button
                          type="button"
                          className="snippet-btn"
                          onClick={() =>
                            insertHtmlSnippet(
                              `<div class="feat-list">\n  <div class="feat"><div class="chk">✓</div><p>Пункт преимущества 1</p></div>\n  <div class="feat"><div class="chk">✓</div><p>Пункт преимущества 2</p></div>\n</div>`
                            )
                          }
                        >
                          📋 Список с галочками
                        </button>
                      </div>

                      {activeSection.id === 'home-hero' && (
                        <div style={{ background: 'rgba(37,195,214,.08)', border: '1px solid rgba(37,195,214,.3)', borderRadius: 10, padding: '12px 16px', marginBottom: 14, fontSize: 13, color: 'var(--txt)', lineHeight: 1.5 }}>
                          💡 <b>Главный экран (Hero):</b> текст расположен вверху благодаря классу <code>align-top</code>. Вы можете свободно менять любые надписи, цифры и кнопки в коде ниже. Чтобы отрегулировать, откуда сверху начинается текст, измените <code>padding-top: 36px</code> во внутреннем блоке <code>&lt;div class="wrap" ...&gt;</code> (например, поставьте <code>20px</code> или <code>50px</code>). Чтобы поменять фоновую фотографию, нажмите кнопку <b>«🌄 Сменить фон»</b> в панели вставки выше.
                        </div>
                      )}

                      {/* HTML Code Editor */}
                      <div className="field">
                        <textarea
                          rows={14}
                          style={{
                            fontFamily: 'ui-monospace, Menlo, Consolas, monospace',
                            fontSize: 13.5,
                            lineHeight: 1.5,
                          }}
                          value={activeSection.html_ru}
                          onChange={(e) =>
                            updateActiveSection((s) => ({
                              ...s,
                              html_ru: e.target.value,
                            }))
                          }
                          placeholder="Вставьте HTML-разметку или текст..."
                        />
                      </div>

                      {/* Live Preview Switcher & Container */}
                      <div style={{ marginTop: 24 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
                          <div>
                            <span style={{ fontWeight: 700, fontSize: 14 }}>Живой предпросмотр блока:</span>
                            <span style={{ fontSize: 12.5, color: 'var(--muted2)', marginLeft: 8 }}>
                              (показывает, как контент будет масштабироваться на экранах)
                            </span>
                          </div>
                          <div className="device-toggle">
                            <button
                              type="button"
                              className={`device-btn ${previewDevice === 'desktop' ? 'active' : ''}`}
                              onClick={() => setPreviewDevice('desktop')}
                            >
                              🖥️ ПК (100%)
                            </button>
                            <button
                              type="button"
                              className={`device-btn ${previewDevice === 'tablet' ? 'active' : ''}`}
                              onClick={() => setPreviewDevice('tablet')}
                            >
                              📲 Планшет (768px)
                            </button>
                            <button
                              type="button"
                              className={`device-btn ${previewDevice === 'mobile' ? 'active' : ''}`}
                              onClick={() => setPreviewDevice('mobile')}
                            >
                              📱 Телефон (375px)
                            </button>
                          </div>
                        </div>

                        <div className="preview-container">
                          <div className={`preview-frame ${previewDevice}`}>
                            {previewDevice === 'mobile' && (
                              <div style={{ textAlign: 'center', fontSize: 11, color: 'var(--muted2)', marginBottom: 14, letterSpacing: 1 }}>
                                • ЭКРАН СМАРТФОНА (375 PX) •
                              </div>
                            )}
                            <div
                              className="builder-content"
                              style={{
                                ['--ph-pt' as string]: `${activeSection.padding_top ?? 46}px`,
                                ['--ph-pb' as string]: `${activeSection.padding_bottom ?? 26}px`,
                                ['--ph-pt-m' as string]: `${Math.min(activeSection.padding_top ?? 46, 30)}px`,
                                ['--ph-pb-m' as string]: `${Math.min(activeSection.padding_bottom ?? 26, 20)}px`,
                              }}
                              dangerouslySetInnerHTML={{
                                __html: activeSection.html_ru,
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div style={{ padding: '16px 0', borderTop: '1px solid var(--line)', marginTop: 16 }}>
                      <h4 style={{ fontSize: 14, marginBottom: 12 }}>Настройка заголовков блока на сайте</h4>
                      <div className="field" style={{ marginBottom: 14 }}>
                        <label>Заголовок блока на сайте</label>
                        <input
                          value={activeSection.title_ru ?? ''}
                          placeholder={activeSection.name}
                          onChange={(e) => updateActiveSection((s) => ({ ...s, title_ru: e.target.value }))}
                        />
                      </div>
                      {activeSection.type === 'catalog_grid' && (
                        <div className="field" style={{ marginBottom: 14 }}>
                          <label>Подзаголовок блока</label>
                          <input
                            value={activeSection.subtitle_ru ?? ''}
                            placeholder="Разделы каталога и типовые серии"
                            onChange={(e) => updateActiveSection((s) => ({ ...s, subtitle_ru: e.target.value }))}
                          />
                        </div>
                      )}
                      <p style={{ fontSize: 13, color: 'var(--muted)', marginTop: 8 }}>
                        💡 Это системный блок (<b>{activeSection.name}</b>). Он автоматически выводит актуальные данные сайта. Вы можете поменять заголовок, скрыть блок или переместить его стрелками ▲ ▼.
                      </p>
                    </div>
                  )}

                  <div className="form-actions" style={{ marginTop: 24, paddingTop: 16, borderTop: '1px solid var(--line)' }}>
                    <button className="btn primary" onClick={saveSections} disabled={busy}>
                      {busy ? '…' : '💾 Сохранить изменения страницы'}
                    </button>
                  </div>
                </>
              ) : (
                <div style={{ textAlign: 'center', padding: '50px 20px', color: 'var(--muted)' }}>
                  На этой странице пока нет разделов. Нажмите «+ Добавить раздел», чтобы создать первый блок.
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* ========================================================
          MODE 2: FILES & DOCUMENTS (MEDIA LIBRARY)
          ======================================================== */}
      {mainMode === 'media' && (
        <div className="a-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
            <div>
              <h3 style={{ margin: 0, fontSize: 18 }}>Файлы, документы и изображения</h3>
              <div style={{ fontSize: 13, color: 'var(--muted2)', marginTop: 4 }}>
                Все файлы сохраняются на сервере в единой папке <code>public/uploads</code> и доступны пользователям для скачивания
              </div>
            </div>
            <div>
              <button
                className="btn primary"
                disabled={uploading}
                onClick={() => fileInputRef.current?.click()}
              >
                {uploading ? 'Загрузка…' : '📤 Загрузить файл с компьютера (до 50 МБ)'}
              </button>
            </div>
          </div>

          <div
            className="upload-dropzone"
            onClick={() => fileInputRef.current?.click()}
          >
            <div style={{ fontSize: 36, marginBottom: 8 }}>📁</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--txt)', marginBottom: 4 }}>
              Нажмите сюда для выбора файла
            </div>
            <div style={{ fontSize: 13, color: 'var(--muted)' }}>
              Поддерживаются документы (*.doc, *.docx, *.xls, *.xlsx, *.pdf, *.txt), архивы (*.zip, *.rar) и картинки (JPG, PNG, WebP, SVG) до 50 МБ
            </div>
          </div>

          {/* Filter tabs */}
          <div style={{ display: 'flex', gap: 8, marginTop: 20, alignItems: 'center' }}>
            <span style={{ fontSize: 13, color: 'var(--muted2)', fontWeight: 700 }}>Фильтр:</span>
            <button
              className={`mini-btn ${mediaFilter === 'all' ? 'on' : ''}`}
              style={{ background: mediaFilter === 'all' ? 'var(--acc)' : undefined, color: mediaFilter === 'all' ? '#05202a' : undefined }}
              onClick={() => setMediaFilter('all')}
            >
              Все файлы ({files.length})
            </button>
            <button
              className={`mini-btn ${mediaFilter === 'images' ? 'on' : ''}`}
              style={{ background: mediaFilter === 'images' ? 'var(--acc)' : undefined, color: mediaFilter === 'images' ? '#05202a' : undefined }}
              onClick={() => setMediaFilter('images')}
            >
              🖼️ Картинки ({files.filter((f) => getFileMeta(f.original_name, f.mime_type).isImage).length})
            </button>
            <button
              className={`mini-btn ${mediaFilter === 'docs' ? 'on' : ''}`}
              style={{ background: mediaFilter === 'docs' ? 'var(--acc)' : undefined, color: mediaFilter === 'docs' ? '#05202a' : undefined }}
              onClick={() => setMediaFilter('docs')}
            >
              📄 Документы (Word, Excel, PDF, TXT) ({files.filter((f) => !getFileMeta(f.original_name, f.mime_type).isImage).length})
            </button>
          </div>

          {loadingFiles ? (
            <div style={{ textAlign: 'center', padding: 40, color: 'var(--muted)' }}>Загрузка списка файлов…</div>
          ) : filteredFiles.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 40, color: 'var(--muted)' }}>
              {files.length === 0 ? 'Пока нет загруженных файлов. Загрузите первый файл кнопкой выше.' : 'Нет файлов, подходящих под выбранный фильтр.'}
            </div>
          ) : (
            <div className="media-grid">
              {filteredFiles.map((file) => {
                const meta = getFileMeta(file.original_name, file.mime_type);
                const downloadUrl = `${file.url}?download=1`;
                return (
                  <div key={file.id} className="media-card">
                    {meta.isImage ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={file.url} alt={file.original_name} className="media-thumb" />
                    ) : (
                      <div className="media-doc-thumb">
                        <span style={{ fontSize: 38 }}>{meta.icon}</span>
                        <span className="media-doc-ext">{meta.ext}</span>
                      </div>
                    )}
                    <div className="media-info">
                      <div className="media-name" title={file.original_name}>{file.original_name}</div>
                      <div className="media-meta">{meta.typeLabel} · {(file.size_bytes / 1024).toFixed(0)} КБ</div>
                      <div className="media-actions">
                        <a
                          href={downloadUrl}
                          download={file.original_name}
                          className="mini-btn"
                          style={{ flex: 1, textAlign: 'center', textDecoration: 'none' }}
                          title="Скачать файл к себе на компьютер"
                        >
                          ⬇️ Скачать
                        </a>
                        <button
                          className="mini-btn"
                          style={{ flex: 1 }}
                          title="Скопировать прямую ссылку на файл"
                          onClick={() => {
                            navigator.clipboard.writeText(downloadUrl);
                            setOk('Ссылка на скачивание скопирована!');
                            setTimeout(() => setOk(null), 2500);
                          }}
                        >
                          🔗 Ссылка
                        </button>
                        <button
                          className="mini-btn red"
                          title="Удалить файл"
                          onClick={() => deleteFile(file.filename, file.original_name)}
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ========================================================
          MODE 3: SITE SETTINGS & CONTACTS
          ======================================================== */}
      {mainMode === 'site' && (
        <form className="aform" onSubmit={saveSiteAndContacts}>
          <h3 style={{ fontSize: 17, fontWeight: 700, marginBottom: 16 }}>Общие настройки шапки и подвала</h3>
          <div className="field">
            <label>Верхняя полоска</label>
            <input value={site?.topbar_ru ?? ''} onChange={(e) => setSite((p) => ({ ...(p ?? {}), topbar_ru: e.target.value }))} />
          </div>
          <div className="field">
            <label>Текст в подвале</label>
            <input value={site?.footer_ru ?? ''} onChange={(e) => setSite((p) => ({ ...(p ?? {}), footer_ru: e.target.value }))} />
          </div>
          <div className="field">
            <label>Ссылка на Telegram</label>
            <input value={site?.telegram_url ?? ''} onChange={(e) => setSite((p) => ({ ...(p ?? {}), telegram_url: e.target.value }))} />
          </div>

          <h3 style={{ fontSize: 17, fontWeight: 700, marginTop: 28, marginBottom: 12 }}>Названия разделов в верхнем меню сайта</h3>
          <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 16 }}>
            Здесь можно переименовать пункты меню в шапке сайта. Если оставить поле пустым — будет стандартное название.
          </p>
          <div className="frow">
            <div className="field">
              <label>Раздел «Главная»</label>
              <input value={site?.nav_home_ru ?? ''} placeholder="Главная" onChange={(e) => setSite((p) => ({ ...(p ?? {}), nav_home_ru: e.target.value }))} />
            </div>
            <div className="field">
              <label>Раздел «О нас»</label>
              <input value={site?.nav_about_ru ?? ''} placeholder="О нас" onChange={(e) => setSite((p) => ({ ...(p ?? {}), nav_about_ru: e.target.value }))} />
            </div>
          </div>
          <div className="frow">
            <div className="field">
              <label>Раздел «Каталог»</label>
              <input value={site?.nav_catalog_ru ?? ''} placeholder="Каталог" onChange={(e) => setSite((p) => ({ ...(p ?? {}), nav_catalog_ru: e.target.value }))} />
            </div>
            <div className="field">
              <label>Раздел «Производство»</label>
              <input value={site?.nav_production_ru ?? ''} placeholder="Производство" onChange={(e) => setSite((p) => ({ ...(p ?? {}), nav_production_ru: e.target.value }))} />
            </div>
          </div>
          <div className="frow">
            <div className="field">
              <label>Раздел «Услуги»</label>
              <input value={site?.nav_services_ru ?? ''} placeholder="Услуги" onChange={(e) => setSite((p) => ({ ...(p ?? {}), nav_services_ru: e.target.value }))} />
            </div>
            <div className="field">
              <label>Раздел «Материалы»</label>
              <input value={site?.nav_materials_ru ?? ''} placeholder="Материалы" onChange={(e) => setSite((p) => ({ ...(p ?? {}), nav_materials_ru: e.target.value }))} />
            </div>
          </div>
          <div className="frow">
            <div className="field">
              <label>Раздел «Контакты»</label>
              <input value={site?.nav_contacts_ru ?? ''} placeholder="Контакты" onChange={(e) => setSite((p) => ({ ...(p ?? {}), nav_contacts_ru: e.target.value }))} />
            </div>
          </div>

          <h3 style={{ fontSize: 17, fontWeight: 700, marginTop: 28, marginBottom: 16 }}>Контактные данные</h3>
          <div className="frow">
            <div className="field">
              <label>Телефон для отображения</label>
              <input value={contacts?.phone ?? ''} onChange={(e) => setContacts((p) => ({ ...(p ?? {}), phone: e.target.value }))} />
            </div>
            <div className="field">
              <label>Телефон (ссылка tel:)</label>
              <input value={contacts?.phone_href ?? ''} onChange={(e) => setContacts((p) => ({ ...(p ?? {}), phone_href: e.target.value }))} />
            </div>
          </div>
          <div className="frow">
            <div className="field">
              <label>E-mail</label>
              <input value={contacts?.email ?? ''} onChange={(e) => setContacts((p) => ({ ...(p ?? {}), email: e.target.value }))} />
            </div>
            <div className="field">
              <label>Telegram в контактах</label>
              <input value={contacts?.telegram_url ?? ''} onChange={(e) => setContacts((p) => ({ ...(p ?? {}), telegram_url: e.target.value }))} />
            </div>
          </div>
          <div className="field">
            <label>Адрес</label>
            <input value={contacts?.address_ru ?? ''} onChange={(e) => setContacts((p) => ({ ...(p ?? {}), address_ru: e.target.value }))} />
          </div>
          <div className="field">
            <label>Режим работы</label>
            <input value={contacts?.hours_ru ?? ''} onChange={(e) => setContacts((p) => ({ ...(p ?? {}), hours_ru: e.target.value }))} />
          </div>

          <div className="form-actions" style={{ marginTop: 24 }}>
            <button className="btn primary" disabled={busy}>
              {busy ? '…' : '💾 Сохранить настройки'}
            </button>
          </div>
        </form>
      )}

      {/* ========================================================
          MODE 4: OTHER JSON DATA
          ======================================================== */}
      {mainMode === 'other' && (
        <div className="a-card">
          <h3 style={{ fontSize: 17, fontWeight: 700, marginBottom: 14 }}>Справочник материалов и ГОСТов (JSON)</h3>
          <div className="field">
            <textarea
              className="json"
              rows={12}
              value={materialsJson}
              onChange={(e) => setMaterialsJson(e.target.value)}
            />
          </div>
          <button className="btn primary" style={{ marginBottom: 28 }} onClick={() => saveJson('materials')} disabled={busy}>
            💾 Сохранить материалы
          </button>

          <h3 style={{ fontSize: 17, fontWeight: 700, marginBottom: 14 }}>Справочник услуг (JSON)</h3>
          <div className="field">
            <textarea
              className="json"
              rows={12}
              value={servicesJson}
              onChange={(e) => setServicesJson(e.target.value)}
            />
          </div>
          <button className="btn primary" onClick={() => saveJson('services')} disabled={busy}>
            💾 Сохранить услуги
          </button>
        </div>
      )}

      {/* ========================================================
          MODAL: ADD SECTION TEMPLATE CHOOSER
          ======================================================== */}
      {showTemplateModal && (
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
          onClick={() => setShowTemplateModal(false)}
        >
          <div
            className="a-card"
            style={{ width: '100%', maxWidth: 560, maxHeight: '90vh', overflowY: 'auto' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
              <h3 style={{ margin: 0, fontSize: 18 }}>Выберите шаблон нового раздела</h3>
              <button className="mini-btn red" onClick={() => setShowTemplateModal(false)}>✕</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {TEMPLATES.map((tpl, i) => (
                <div
                  key={i}
                  style={{
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid var(--line)',
                    borderRadius: 10,
                    padding: '14px 16px',
                    cursor: 'pointer',
                    transition: '.15s',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'var(--acc)')}
                  onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--line)')}
                  onClick={() => addSectionFromTemplate(i)}
                >
                  <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--txt)', marginBottom: 4 }}>
                    {tpl.label}
                  </div>
                  <div style={{ fontSize: 13, color: 'var(--muted)' }}>{tpl.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL: SELECT FILE / IMAGE / DOCUMENT TO INSERT
          ======================================================== */}
      {showFilePicker && (
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
          onClick={() => setShowFilePicker(false)}
        >
          <div
            className="a-card"
            style={{ width: '100%', maxWidth: 760, maxHeight: '85vh', overflowY: 'auto' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ margin: 0, fontSize: 18 }}>{pickerMode === 'background' ? '🌄 Выберите изображение для фона' : 'Выберите файл для вставки'}</h3>
              <button className="mini-btn red" onClick={() => setShowFilePicker(false)}>✕</button>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 10 }}>
              <div style={{ display: 'flex', gap: 6 }}>
                <button
                  type="button"
                  className={`mini-btn ${pickerTab === 'all' ? 'on' : ''}`}
                  onClick={() => setPickerTab('all')}
                >
                  Все ({files.length})
                </button>
                <button
                  type="button"
                  className={`mini-btn ${pickerTab === 'images' ? 'on' : ''}`}
                  onClick={() => setPickerTab('images')}
                >
                  🖼️ Фото
                </button>
                <button
                  type="button"
                  className={`mini-btn ${pickerTab === 'docs' ? 'on' : ''}`}
                  onClick={() => setPickerTab('docs')}
                >
                  📄 Документы (Word, Excel, PDF)
                </button>
              </div>
              <button
                type="button"
                className="mini-btn"
                style={{ background: 'rgba(37,195,214,.12)', color: 'var(--acc)', borderColor: 'var(--acc)' }}
                disabled={uploading}
                onClick={() => fileInputRef.current?.click()}
              >
                {uploading ? '⏳ Загрузка…' : '+ Загрузить новый файл'}
              </button>
            </div>

            {pickerFilteredFiles.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 30, color: 'var(--muted)' }}>
                Нет подходящих файлов. Загрузите файл с компьютера.
              </div>
            ) : (
              <div className="media-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))' }}>
                {pickerFilteredFiles.map((file) => {
                  const meta = getFileMeta(file.original_name, file.mime_type);
                  return (
                    <div key={file.id} className="media-card">
                      {meta.isImage ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={file.url} alt={file.original_name} className="media-thumb" style={{ height: 100 }} />
                      ) : (
                        <div className="media-doc-thumb" style={{ height: 100 }}>
                          <span style={{ fontSize: 32 }}>{meta.icon}</span>
                          <span className="media-doc-ext">{meta.ext}</span>
                        </div>
                      )}
                      <div style={{ padding: 10, display: 'flex', flexDirection: 'column', gap: 6 }}>
                        <div className="media-name" style={{ fontSize: 12 }} title={file.original_name}>
                          {file.original_name}
                        </div>
                        <div style={{ fontSize: 11, color: 'var(--muted2)' }}>
                          {(file.size_bytes / 1024).toFixed(0)} КБ
                        </div>

                        {meta.isImage ? (
                          <button
                            type="button"
                            className="mini-btn"
                            style={{ width: '100%', background: 'rgba(37,195,214,.12)', color: 'var(--acc)' }}
                            onClick={() => {
                              if (pickerMode === 'background') {
                                updateBackgroundImage(file.url);
                              } else {
                                insertImageTag(file.url, file.original_name);
                              }
                            }}
                          >
                            {pickerMode === 'background' ? '🌄 Выбрать как фон' : 'Вставить картинку'}
                          </button>
                        ) : (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                            <button
                              type="button"
                              className="mini-btn"
                              style={{ width: '100%', background: 'rgba(37,195,214,.12)', color: 'var(--acc)', fontSize: 11, padding: '4px 6px' }}
                              onClick={() => insertDocDownloadButton(file)}
                              title="Вставить компактную кнопку скачивания файла"
                            >
                              📥 Кнопка скачивания
                            </button>
                            <button
                              type="button"
                              className="mini-btn"
                              style={{ width: '100%', fontSize: 11, padding: '4px 6px' }}
                              onClick={() => insertDocCard(file)}
                              title="Вставить большую карточку файла"
                            >
                              🃏 Карточка файла
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
