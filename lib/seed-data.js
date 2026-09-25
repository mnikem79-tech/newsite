// Seed data for the neutral demo site (newsite) — Russian only.
// Replace with real client content or fill via /admin.

const categories = [
  {
    slug: 'demo-1', code: '1.1', icon: '📦',
    name_ru: 'Демо-раздел 1',
    note_ru: 'Пример категории. Удалите её и создайте свои разделы в админке.',
  },
  {
    slug: 'demo-2', code: '1.2', icon: '🧰',
    name_ru: 'Демо-раздел 2',
    note_ru: 'Второй пример категории для проверки каталога и фильтров.',
  },
];

// [code, name_ru, desc_ru, category_slug]
const P = (code, ru, dru, cat) => ({ code, name_ru: ru, description_ru: dru, category_slug: cat });

const products = [
  P('1.1.1', 'Демо-товар 1',
    'Пример товара. Откройте карточку, проверьте корзину и оформление заказа, затем удалите.', 'demo-1'),
  P('1.2.1', 'Демо-товар 2',
    'Второй пример товара в другом разделе каталога.', 'demo-2'),
];

const materials = [
  { code: 'DEMO-1', title_ru: 'Демо-документ 1', std: 'Пример записи. Замените своими материалами.' },
];

const services = [
  {
    num: '1.1', title_ru: 'Демо-услуга 1',
    body_ru: 'Пример услуги. Опишите здесь реальную услугу компании.',
    list_ru: [],
  },
];

const contentDefaults = {
  home_hero: {
    kicker_ru: 'Демонстрационный сайт',
    title_ru: 'Новый сайт на готовом движке',
    subtitle_ru: 'Каталог товаров, заказы, конструктор страниц и уведомления уже работают. Замените этот текст своим в админке.',
  },
  about_intro: {
    badge_ru: 'Демо',
    title_ru: 'Кто мы',
    intro_ru: 'Пример текста о компании. Расскажите здесь о своём бизнесе: чем занимаетесь, сколько лет на рынке, почему выбирают вас.',
  },
  contacts: {
    phone: '+7 (000) 000-00-00',
    phone_href: 'tel:+70000000000',
    email: 'info@newsite.nail-app.ru',
    address_ru: 'Адрес уточняется',
    hours_ru: 'Пн–Пт 9:00–18:00',
    telegram_url: '',
  },
  site: {
    topbar_ru: 'Пн–Пт 9:00–18:00  ·  +7 (000) 000-00-00  ·  info@newsite.nail-app.ru',
    footer_ru: '© 2026 Новый сайт',
    telegram_url: '',
  },
  materials,
  services,
};

module.exports = { categories, products, contentDefaults, materials, services };
