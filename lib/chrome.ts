import type { ChromeAlign, ChromeBlock, ChromeKind } from './types';

export type ChromeArea = 'header' | 'footer';

export interface ChromeKindDef {
  kind: ChromeKind;
  label: string;
  hint: string;
  /** in which area the block makes sense */
  area: ChromeArea | 'both';
  /** fields shown in the editor */
  fields: ('text' | 'href' | 'html_ru' | 'lines')[];
}

/** Ready-made blocks that can be added to the header / footer. */
export const CHROME_KINDS: ChromeKindDef[] = [
  {
    kind: 'topbar',
    label: 'Верхняя полоска',
    hint: 'Тонкая полоса над шапкой: часы работы, телефон, e-mail. Пусто — блок не показывается.',
    area: 'header',
    fields: ['text'],
  },
  {
    kind: 'logo',
    label: 'Логотип',
    hint: 'Картинка логотипа со ссылкой на главную. Вторая строка — подпись под логотипом.',
    area: 'both',
    fields: ['text'],
  },
  {
    kind: 'menu',
    label: 'Меню разделов',
    hint: 'Пункты верхнего меню сайта. Названия берутся из вкладки «Шапка и подвал».',
    area: 'header',
    fields: [],
  },
  {
    kind: 'phone',
    label: 'Телефон',
    hint: 'Телефон из раздела «Контакты», ссылка для звонка.',
    area: 'both',
    fields: [],
  },
  {
    kind: 'email',
    label: 'E-mail',
    hint: 'Адрес электронной почты из раздела «Контакты».',
    area: 'both',
    fields: [],
  },
  {
    kind: 'address',
    label: 'Адрес',
    hint: 'Адрес из раздела «Контакты».',
    area: 'footer',
    fields: [],
  },
  {
    kind: 'hours',
    label: 'Режим работы',
    hint: 'Часы работы из раздела «Контакты».',
    area: 'footer',
    fields: [],
  },
  {
    kind: 'contacts',
    label: 'Все контакты списком',
    hint: 'Телефон, e-mail, адрес, режим работы и Telegram — одной колонкой.',
    area: 'footer',
    fields: [],
  },
  {
    kind: 'socials',
    label: 'Ссылка на Telegram',
    hint: 'Кнопка-ссылка на Telegram-канал. Адрес канала задаётся прямо в блоке.',
    area: 'both',
    fields: ['text', 'href'],
  },
  {
    kind: 'button',
    label: 'Кнопка',
    hint: 'Кнопка с произвольным текстом и ссылкой, например «Написать нам» или «Скачать прайс».',
    area: 'both',
    fields: ['text', 'href'],
  },
  {
    kind: 'links',
    label: 'Список ссылок',
    hint: 'Колонка ссылок. Каждая ссылка с новой строки в виде: Название | /адрес',
    area: 'footer',
    fields: ['text', 'lines'],
  },
  {
    kind: 'copyright',
    label: 'Копирайт (низ подвала)',
    hint: 'Текст в самой нижней строке подвала.',
    area: 'footer',
    fields: ['text'],
  },
  {
    kind: 'text',
    label: 'Текст',
    hint: 'Произвольная строка текста — например, короткое описание компании в подвале.',
    area: 'both',
    fields: ['text'],
  },
  {
    kind: 'html',
    label: 'Свой HTML',
    hint: 'Произвольный HTML-код. Для тех, кто умеет вёрстку.',
    area: 'both',
    fields: ['html_ru'],
  },
];

export function kindsForArea(area: ChromeArea): ChromeKindDef[] {
  return CHROME_KINDS.filter((k) => k.area === area || k.area === 'both');
}

export function kindDef(kind: ChromeKind): ChromeKindDef {
  return CHROME_KINDS.find((k) => k.kind === kind) ?? CHROME_KINDS[CHROME_KINDS.length - 1];
}

let seq = 0;
export function newBlockId(prefix: string): string {
  seq += 1;
  return `${prefix}-${Date.now().toString(36)}-${seq}`;
}

/** A fresh block of the given kind with sensible defaults. */
export function makeBlock(kind: ChromeKind, area: ChromeArea): ChromeBlock {
  const def = kindDef(kind);
  const b: ChromeBlock = {
    id: newBlockId(area),
    kind,
    name: def.label,
    is_active: true,
    align: 'start',
  };
  switch (kind) {
    case 'topbar':
      b.text = 'Пн–Пт 9:00–18:00  ·  +7 (000) 000-00-00';
      break;
    case 'logo':
      b.text = 'Демонстрационный сайт';
      break;
    case 'socials':
      b.text = 'Telegram-канал';
      b.href = '';
      break;
    case 'text':
      b.text = '';
      break;
    case 'button':
      b.text = 'Написать нам';
      b.href = '/contacts';
      break;
    case 'links':
      b.text = 'Навигация';
      b.lines = 'О компании | /about\nУслуги | /services\nМатериалы | /materials\nКонтакты | /contacts';
      break;
    case 'copyright':
      b.text = '© 2026 Новый сайт';
      break;
    case 'html':
      b.html_ru = '<div>Ваш HTML</div>';
      break;
    default:
      break;
  }
  return b;
}

/** Default set of blocks used until the admin changes them. */
export function defaultChromeBlocks(area: ChromeArea): ChromeBlock[] {
  if (area === 'header') {
    return [
      makeBlock('topbar', 'header'),
      makeBlock('logo', 'header'),
      makeBlock('menu', 'header'),
      makeBlock('socials', 'header'),
    ];
  }
  return [
    makeBlock('logo', 'footer'),
    makeBlock('links', 'footer'),
    makeBlock('contacts', 'footer'),
    makeBlock('copyright', 'footer'),
  ];
}

/** Guard: drop unknown kinds / broken rows coming from the DB. */
export function sanitizeChrome(raw: unknown, area: ChromeArea): ChromeBlock[] {
  if (!Array.isArray(raw)) return defaultChromeBlocks(area);
  const known = new Set(CHROME_KINDS.map((k) => k.kind));
  const out: ChromeBlock[] = [];
  for (const item of raw) {
    if (!item || typeof item !== 'object') continue;
    const b = item as Partial<ChromeBlock>;
    if (!b.kind || !known.has(b.kind)) continue;
    out.push({
      id: typeof b.id === 'string' && b.id ? b.id : newBlockId(area),
      kind: b.kind,
      name: typeof b.name === 'string' && b.name ? b.name : kindDef(b.kind).label,
      is_active: b.is_active !== false,
      align: b.align === 'center' || b.align === 'end' ? b.align : 'start',
      text: typeof b.text === 'string' ? b.text : undefined,
      href: typeof b.href === 'string' ? b.href : undefined,
      html_ru: typeof b.html_ru === 'string' ? b.html_ru : undefined,
      lines: typeof b.lines === 'string' ? b.lines : undefined,
    });
  }
  return out.length ? out : defaultChromeBlocks(area);
}
