// Seed data for the neutral demo site (newsite) — RU/EN.
// Replace with real client content or fill via /admin.

const categories = [
  {
    slug: 'demo-1', code: '1.1', icon: '📦',
    name_ru: 'Демо-раздел 1', name_en: 'Demo section 1',
    note_ru: 'Пример категории. Удалите её и создайте свои разделы в админке.',
    note_en: 'Sample category. Delete it and create your own sections in the admin panel.',
  },
  {
    slug: 'demo-2', code: '1.2', icon: '🧰',
    name_ru: 'Демо-раздел 2', name_en: 'Demo section 2',
    note_ru: 'Второй пример категории для проверки каталога и фильтров.',
    note_en: 'Second sample category to check the catalog and filters.',
  },
];

// [code, name_ru, name_en, desc_ru, desc_en, category_slug]
const P = (code, ru, en, dru, den, cat) => ({ code, name_ru: ru, name_en: en, description_ru: dru, description_en: den, category_slug: cat });

const products = [
  P('1.1.1', 'Демо-товар 1', 'Demo product 1',
    'Пример товара. Откройте карточку, проверьте корзину и оформление заказа, затем удалите.',
    'Sample product. Open the card, check the cart and checkout, then delete it.', 'demo-1'),
  P('1.2.1', 'Демо-товар 2', 'Demo product 2',
    'Второй пример товара в другом разделе каталога.',
    'Second sample product in another catalog section.', 'demo-2'),
];

const materials = [
  { code: 'DEMO-1', title_ru: 'Демо-документ 1', title_en: 'Demo document 1', std: 'Пример записи. Замените своими материалами.' },
];

const services = [
  {
    num: '1.1', title_ru: 'Демо-услуга 1', title_en: 'Demo service 1',
    body_ru: 'Пример услуги. Опишите здесь реальную услугу компании.',
    body_en: 'Sample service. Describe the real company service here.',
    list_ru: [], list_en: [],
  },
];

const contentDefaults = {
  home_hero: {
    kicker_ru: 'Демонстрационный сайт', kicker_en: 'Demo website',
    title_ru: 'Новый сайт на готовом движке',
    title_en: 'New site on a ready engine',
    subtitle_ru: 'Каталог товаров, заказы, конструктор страниц и уведомления уже работают. Замените этот текст своим в админке.',
    subtitle_en: 'Product catalog, orders, page builder and notifications already work. Replace this text with your own in the admin panel.',
  },
  about_intro: {
    badge_ru: 'Демо', badge_en: 'Demo',
    title_ru: 'Кто мы', title_en: 'Who we are',
    intro_ru: 'Пример текста о компании. Расскажите здесь о своём бизнесе: чем занимаетесь, сколько лет на рынке, почему выбирают вас.',
    intro_en: 'Sample company text. Tell your story here: what you do, how long you have been in business, why customers choose you.',
  },
  contacts: {
    phone: '+7 (000) 000-00-00',
    phone_href: 'tel:+70000000000',
    email: 'info@newsite.nail-app.ru',
    address_ru: 'Адрес уточняется',
    address_en: 'Address to be confirmed',
    hours_ru: 'Пн–Пт 9:00–18:00',
    hours_en: 'Mon–Fri 9:00–18:00',
    telegram_url: '',
  },
  site: {
    topbar_ru: 'Пн–Пт 9:00–18:00  ·  +7 (000) 000-00-00  ·  info@newsite.nail-app.ru',
    topbar_en: 'Mon–Fri 9:00–18:00  ·  +7 (000) 000-00-00  ·  info@newsite.nail-app.ru',
    footer_ru: '© 2026 Новый сайт',
    footer_en: '© 2026 New Site',
    telegram_url: '',
  },
  materials,
  services,
};

module.exports = { categories, products, contentDefaults, materials, services };
