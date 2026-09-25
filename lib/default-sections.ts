import type { PageSection } from './types';

export const DEFAULT_PAGE_SECTIONS: Record<string, PageSection[]> = {
  home: [
    {
      id: 'home-hero',
      name: 'Главный экран (Hero)',
      type: 'hero',
      is_active: true,
      container: 'full',
      padding_top: 0,
      padding_bottom: 0,
      html_ru: `<div class="hero align-top" style="min-height: 540px;">
  <div class="bgimg" style="background-image: url('/img-2.jpg');"></div>
  <div class="wrap" style="padding-top: 36px; padding-bottom: 50px;">
    <div class="kicker">
      ✨ Демонстрационный сайт
    </div>
    <h1>
      Новый сайт <span>на готовом движке</span>
    </h1>
    <p>
      Каталог товаров, заказы, конструктор страниц и уведомления уже работают. Замените этот текст своим в разделе «Контент» админки.
    </p>
    <div class="cta">
      <a href="/catalog" class="btn primary">
        <span>Смотреть каталог</span> →
      </a>
      <a href="/contacts" class="btn ghost">
        Оставить заявку
      </a>
    </div>
    <div class="stats">
      <div class="stat">
        <div class="n">2</div>
        <div class="l">Демо-раздела в каталоге</div>
      </div>
      <div class="stat">
        <div class="n">2</div>
        <div class="l">Демо-товара для проверки</div>
      </div>
      <div class="stat">
        <div class="n">5+</div>
        <div class="l">Минут на замену контента</div>
      </div>
    </div>
  </div>
</div>`,
      html_en: `<div class="hero align-top" style="min-height: 540px;">
  <div class="bgimg" style="background-image: url('/img-2.jpg');"></div>
  <div class="wrap" style="padding-top: 36px; padding-bottom: 50px;">
    <div class="kicker">
      ✨ Demo website
    </div>
    <h1>
      New site <span>on a ready engine</span>
    </h1>
    <p>
      Product catalog, orders, page builder and notifications already work. Replace this text with your own in the admin «Content» section.
    </p>
    <div class="cta">
      <a href="/catalog" class="btn primary">
        <span>View catalog</span> →
      </a>
      <a href="/contacts" class="btn ghost">
        Send a request
      </a>
    </div>
    <div class="stats">
      <div class="stat">
        <div class="n">2</div>
        <div class="l">Demo catalog sections</div>
      </div>
      <div class="stat">
        <div class="n">2</div>
        <div class="l">Demo products to try</div>
      </div>
      <div class="stat">
        <div class="n">5+</div>
        <div class="l">Minutes to replace content</div>
      </div>
    </div>
  </div>
</div>`,
    },
    {
      id: 'home-catalog',
      name: 'Каталог продукции (сетка категорий)',
      type: 'catalog_grid',
      is_active: true,
      container: 'wrap',
      padding_top: 24,
      padding_bottom: 18,
      html_ru: '',
      html_en: '',
    },
    {
      id: 'home-about',
      name: 'О компании (блок с фото и преимуществами)',
      type: 'html',
      is_active: true,
      container: 'wrap',
      padding_top: 18,
      padding_bottom: 18,
      html_ru: `<div class="two">
  <div class="figure">
    <img src="/img-3.jpg" alt="Новый сайт" />
    <div class="cap">Демонстрационное фото</div>
  </div>
  <div>
    <div class="kick">О нас</div>
    <h2 class="sec">Новый сайт</h2>
    <p class="lead" style="margin-top: 16px;">
      Пример блока о компании. Расскажите здесь о своём бизнесе: чем занимаетесь и почему выбирают вас.
    </p>
    <div class="feat-list" style="margin-top: 20px;">
      <div class="feat">
        <div class="chk">✓</div>
        <p>Первое преимущество компании.</p>
      </div>
      <div class="feat">
        <div class="chk">✓</div>
        <p>Второе преимущество компании.</p>
      </div>
      <div class="feat">
        <div class="chk">✓</div>
        <p>Третье преимущество компании.</p>
      </div>
    </div>
  </div>
</div>`,
      html_en: `<div class="two">
  <div class="figure">
    <img src="/img-3.jpg" alt="New Site" />
    <div class="cap">Demo photo</div>
  </div>
  <div>
    <div class="kick">About us</div>
    <h2 class="sec">New Site</h2>
    <p class="lead" style="margin-top: 16px;">
      Sample company block. Tell your story here: what you do and why customers choose you.
    </p>
    <div class="feat-list" style="margin-top: 20px;">
      <div class="feat">
        <div class="chk">✓</div>
        <p>First company advantage.</p>
      </div>
      <div class="feat">
        <div class="chk">✓</div>
        <p>Second company advantage.</p>
      </div>
      <div class="feat">
        <div class="chk">✓</div>
        <p>Third company advantage.</p>
      </div>
    </div>
  </div>
</div>`,
    },
    {
      id: 'home-cta',
      name: 'Баннер заявки (призыв к действию)',
      type: 'html',
      is_active: true,
      container: 'wrap',
      padding_top: 10,
      padding_bottom: 36,
      html_ru: `<div class="cta-strip">
  <div>
    <h3>Остались вопросы?</h3>
    <p>Оставьте заявку — свяжемся с вами и всё расскажем.</p>
  </div>
  <a href="/contacts" class="btn primary">Связаться с нами →</a>
</div>`,
      html_en: `<div class="cta-strip">
  <div>
    <h3>Any questions left?</h3>
    <p>Send a request — we will get back to you shortly.</p>
  </div>
  <a href="/contacts" class="btn primary">Contact us →</a>
</div>`,
    },
  ],

  about: [
    {
      id: 'about-nav',
      name: 'Блок навигации',
      type: 'html',
      is_active: true,
      container: 'full',
      padding_top: 46,
      padding_bottom: 26,
      html_ru: `<div class="pagehead">
  <div class="wrap">
    <div class="crumb"><a href="/">Главная</a> / <span>О нас</span></div>
    <div class="kick">О нас</div>
    <h1>О компании</h1>
    <p>Новый сайт — демонстрационный проект на готовом движке</p>
  </div>
</div>`,
      html_en: `<div class="pagehead">
  <div class="wrap">
    <div class="crumb"><a href="/">Home</a> / <span>About</span></div>
    <div class="kick">About us</div>
    <h1>About the company</h1>
    <p>New Site — a demo project on a ready engine</p>
  </div>
</div>`,
    },
    {
      id: 'about-intro',
      name: 'О компании (вводный блок с фото)',
      type: 'html',
      is_active: true,
      container: 'wrap',
      padding_top: 28,
      padding_bottom: 16,
      html_ru: `<div class="two">
  <div>
    <div class="badge">О компании</div>
    <h2 class="sec">Новый сайт</h2>
    <p class="lead" style="margin-top: 16px;">
      Пример вводного текста. Опишите здесь историю компании, направления работы и ключевые факты.
    </p>
    <div class="feat-list" style="margin-top: 22px;">
      <div class="feat"><div class="chk">✓</div><p>Первый ключевой факт о компании.</p></div>
      <div class="feat"><div class="chk">✓</div><p>Второй ключевой факт о компании.</p></div>
      <div class="feat"><div class="chk">✓</div><p>Третий ключевой факт о компании.</p></div>
    </div>
  </div>
  <div class="figure">
    <img src="/img-3.jpg" alt="Новый сайт" />
    <div class="cap">Демонстрационное фото</div>
  </div>
</div>`,
      html_en: `<div class="two">
  <div>
    <div class="badge">About company</div>
    <h2 class="sec">New Site</h2>
    <p class="lead" style="margin-top: 16px;">
      Sample intro text. Describe the company history, business lines and key facts here.
    </p>
    <div class="feat-list" style="margin-top: 22px;">
      <div class="feat"><div class="chk">✓</div><p>First key fact about the company.</p></div>
      <div class="feat"><div class="chk">✓</div><p>Second key fact about the company.</p></div>
      <div class="feat"><div class="chk">✓</div><p>Third key fact about the company.</p></div>
    </div>
  </div>
  <div class="figure">
    <img src="/img-3.jpg" alt="New Site" />
    <div class="cap">Demo photo</div>
  </div>
</div>`,
    },
    {
      id: 'about-pubs',
      name: 'Публикации',
      type: 'publications',
      is_active: true,
      container: 'wrap',
      padding_top: 16,
      padding_bottom: 16,
      html_ru: '',
      html_en: '',
    },
    {
      id: 'about-patents',
      name: 'Патенты и свидетельства на программы',
      type: 'patents',
      is_active: true,
      container: 'wrap',
      padding_top: 16,
      padding_bottom: 16,
      html_ru: '',
      html_en: '',
    },
    {
      id: 'about-certs',
      name: 'Сертификаты и декларации',
      type: 'html',
      is_active: true,
      container: 'wrap',
      padding_top: 16,
      padding_bottom: 16,
      html_ru: `<div class="shead"><div><h2 class="sec">Документы</h2></div></div>
<div class="notes">
  Пример блока документов. Разместите здесь сертификаты, лицензии и разрешительную документацию компании.
</div>`,
      html_en: `<div class="shead"><div><h2 class="sec">Documents</h2></div></div>
<div class="notes">
  Sample documents block. Place company certificates, licenses and permits here.
</div>`,
    },
    {
      id: 'about-news',
      name: 'Новости',
      type: 'html',
      is_active: true,
      container: 'wrap',
      padding_top: 16,
      padding_bottom: 16,
      html_ru: `<div class="shead"><div><h2 class="sec">Новости</h2></div></div>
<div class="notes">
  Раздел новостей в разработке.
</div>`,
      html_en: `<div class="shead"><div><h2 class="sec">News</h2></div></div>
<div class="notes">
  The news section is under development.
</div>`,
    },
    {
      id: 'about-projects',
      name: 'Наши проекты (карточки)',
      type: 'html',
      is_active: true,
      container: 'wrap',
      padding_top: 16,
      padding_bottom: 36,
      html_ru: `<div class="shead"><div><h2 class="sec">Наши проекты</h2></div></div>
<div class="grid g3">
  <div class="card"><div class="chd"><div class="ic">📌</div><h3>Демо-проект 1</h3></div><p>Краткое описание первого демонстрационного проекта.</p></div>
  <div class="card"><div class="chd"><div class="ic">📌</div><h3>Демо-проект 2</h3></div><p>Краткое описание второго демонстрационного проекта.</p></div>
  <div class="card"><div class="chd"><div class="ic">📌</div><h3>Демо-проект 3</h3></div><p>Краткое описание третьего демонстрационного проекта.</p></div>
</div>`,
      html_en: `<div class="shead"><div><h2 class="sec">Our projects</h2></div></div>
<div class="grid g3">
  <div class="card"><div class="chd"><div class="ic">📌</div><h3>Demo project 1</h3></div><p>Short description of the first demo project.</p></div>
  <div class="card"><div class="chd"><div class="ic">📌</div><h3>Demo project 2</h3></div><p>Short description of the second demo project.</p></div>
  <div class="card"><div class="chd"><div class="ic">📌</div><h3>Demo project 3</h3></div><p>Short description of the third demo project.</p></div>
</div>`,
    },
  ],

  catalog: [
    {
      id: 'catalog-nav',
      name: 'Блок навигации',
      type: 'html',
      is_active: true,
      container: 'full',
      padding_top: 46,
      padding_bottom: 26,
      html_ru: `<div class="pagehead">
  <div class="wrap">
    <div class="crumb"><a href="/">Главная</a> / <span>Каталог продукции</span></div>
    <div class="kick">Каталог продукции</div>
    <h1>Каталог продукции</h1>
    <p>Выберите раздел ниже — на каждой позиции можно оформить заказ или запросить коммерческое предложение.</p>
  </div>
</div>`,
      html_en: `<div class="pagehead">
  <div class="wrap">
    <div class="crumb"><a href="/">Home</a> / <span>Product catalog</span></div>
    <div class="kick">Product catalog</div>
    <h1>Product catalog</h1>
    <p>Choose a section below — every item can be ordered directly or quoted.</p>
  </div>
</div>`,
    },
    {
      id: 'catalog-main',
      name: 'Каталог товаров и фильтр категорий',
      type: 'catalog_view',
      is_active: true,
      container: 'wrap',
      padding_top: 24,
      padding_bottom: 40,
      html_ru: '',
      html_en: '',
    },
  ],

  production: [
    {
      id: 'production-nav',
      name: 'Блок навигации',
      type: 'html',
      is_active: true,
      container: 'full',
      padding_top: 46,
      padding_bottom: 26,
      html_ru: `<div class="pagehead">
  <div class="wrap">
    <div class="crumb"><a href="/">Главная</a> / <span>Производство</span></div>
    <div class="kick">Производство</div>
    <h1>Производство</h1>
    <p>Пример страницы производства. Опишите здесь мощности, процессы и возможности.</p>
  </div>
</div>`,
      html_en: `<div class="pagehead">
  <div class="wrap">
    <div class="crumb"><a href="/">Home</a> / <span>Production</span></div>
    <div class="kick">Production</div>
    <h1>Production</h1>
    <p>Sample production page. Describe capacities, processes and capabilities here.</p>
  </div>
</div>`,
    },
    {
      id: 'prod-banner',
      name: 'Баннер производства под заказ',
      type: 'html',
      is_active: true,
      container: 'wrap',
      padding_top: 24,
      padding_bottom: 12,
      html_ru: `<div class="prod-banner" style="background-image: url('/img-3.jpg');">
  <div class="txt">
    <div class="badge">Демонстрационный баннер</div>
    <h3>Заголовок баннера</h3>
    <p>
      Пример текста баннера. Замените своим предложением.
    </p>
  </div>
</div>`,
      html_en: `<div class="prod-banner" style="background-image: url('/img-3.jpg');">
  <div class="txt">
    <div class="badge">Demo banner</div>
    <h3>Banner headline</h3>
    <p>
      Sample banner text. Replace it with your own offer.
    </p>
  </div>
</div>`,
    },
    {
      id: 'prod-cards',
      name: 'Демо-карточки направлений',
      type: 'html',
      is_active: true,
      container: 'wrap',
      padding_top: 12,
      padding_bottom: 36,
      html_ru: `<div class="grid g2">
  <div class="card">
    <div class="chd">
      <div class="ic">🏭</div>
      <h3>Направление 1</h3>
    </div>
    <p>
      Краткое описание первого демонстрационного направления работы компании.
    </p>
    <div class="feat-list" style="margin-top: 14px;">
      <div class="feat"><div class="chk">✓</div><p>Пункт первый</p></div>
      <div class="feat"><div class="chk">✓</div><p>Пункт второй</p></div>
      <div class="feat"><div class="chk">✓</div><p>Пункт третий</p></div>
    </div>
  </div>
  <div class="card">
    <div class="chd">
      <div class="ic">⚙️</div>
      <h3>Направление 2</h3>
    </div>
    <p>
      Краткое описание второго демонстрационного направления работы компании.
    </p>
    <div class="feat-list" style="margin-top: 14px;">
      <div class="feat"><div class="chk">✓</div><p>Пункт первый</p></div>
      <div class="feat"><div class="chk">✓</div><p>Пункт второй</p></div>
      <div class="feat"><div class="chk">✓</div><p>Пункт третий</p></div>
    </div>
  </div>
</div>`,
      html_en: `<div class="grid g2">
  <div class="card">
    <div class="chd">
      <div class="ic">🏭</div>
      <h3>Direction 1</h3>
    </div>
    <p>
      Short description of the first demo business direction.
    </p>
    <div class="feat-list" style="margin-top: 14px;">
      <div class="feat"><div class="chk">✓</div><p>First point</p></div>
      <div class="feat"><div class="chk">✓</div><p>Second point</p></div>
      <div class="feat"><div class="chk">✓</div><p>Third point</p></div>
    </div>
  </div>
  <div class="card">
    <div class="chd">
      <div class="ic">⚙️</div>
      <h3>Direction 2</h3>
    </div>
    <p>
      Short description of the second demo business direction.
    </p>
    <div class="feat-list" style="margin-top: 14px;">
      <div class="feat"><div class="chk">✓</div><p>First point</p></div>
      <div class="feat"><div class="chk">✓</div><p>Second point</p></div>
      <div class="feat"><div class="chk">✓</div><p>Third point</p></div>
    </div>
  </div>
</div>`,
    },
  ],

  services: [
    {
      id: 'services-nav',
      name: 'Блок навигации',
      type: 'html',
      is_active: true,
      container: 'full',
      padding_top: 46,
      padding_bottom: 26,
      html_ru: `<div class="pagehead">
  <div class="wrap">
    <div class="crumb"><a href="/">Главная</a> / <span>Услуги</span></div>
    <div class="kick">Услуги</div>
    <h1>Услуги</h1>
    <p>Пример страницы услуг. Список ниже редактируется через базу demo-контента.</p>
  </div>
</div>`,
      html_en: `<div class="pagehead">
  <div class="wrap">
    <div class="crumb"><a href="/">Home</a> / <span>Services</span></div>
    <div class="kick">Services</div>
    <h1>Services</h1>
    <p>Sample services page. The list below comes from the demo content.</p>
  </div>
</div>`,
    },
    {
      id: 'services-list',
      name: 'Список инженерных услуг',
      type: 'services_list',
      is_active: true,
      container: 'wrap',
      padding_top: 24,
      padding_bottom: 36,
      html_ru: '',
      html_en: '',
    },
  ],

  contacts: [
    {
      id: 'contacts-nav',
      name: 'Блок навигации',
      type: 'html',
      is_active: true,
      container: 'full',
      padding_top: 46,
      padding_bottom: 26,
      html_ru: `<div class="pagehead">
  <div class="wrap">
    <div class="crumb"><a href="/">Главная</a> / <span>Контакты</span></div>
    <div class="kick">Контакты</div>
    <h1>Контакты</h1>
    <p>Свяжитесь с нами удобным способом — ответим в рабочее время.</p>
  </div>
</div>`,
      html_en: `<div class="pagehead">
  <div class="wrap">
    <div class="crumb"><a href="/">Home</a> / <span>Contacts</span></div>
    <div class="kick">Contacts</div>
    <h1>Contacts</h1>
    <p>Get in touch with us — we will reply during working hours.</p>
  </div>
</div>`,
    },
    {
      id: 'contacts-main',
      name: 'Контакты, интерактивная карта и форма заявки',
      type: 'contacts_main',
      is_active: true,
      container: 'wrap',
      padding_top: 24,
      padding_bottom: 36,
      html_ru: '',
      html_en: '',
    },
  ],

  materials: [
    {
      id: 'materials-nav',
      name: 'Блок навигации',
      type: 'html',
      is_active: true,
      container: 'full',
      padding_top: 46,
      padding_bottom: 26,
      html_ru: `<div class="pagehead">
  <div class="wrap">
    <div class="crumb"><a href="/">Главная</a> / <span>Материалы и документация</span></div>
    <div class="kick">Материалы и документация</div>
    <h1>Материалы и документация</h1>
    <p>Пример страницы материалов. Список ниже редактируется через базу demo-контента.</p>
  </div>
</div>`,
      html_en: `<div class="pagehead">
  <div class="wrap">
    <div class="crumb"><a href="/">Home</a> / <span>Materials & documentation</span></div>
    <div class="kick">Materials & documentation</div>
    <h1>Materials & documentation</h1>
    <p>Sample materials page. The list below comes from the demo content.</p>
  </div>
</div>`,
    },
    {
      id: 'materials-list',
      name: 'Список материалов и ГОСТов',
      type: 'materials_list',
      is_active: true,
      container: 'wrap',
      padding_top: 24,
      padding_bottom: 16,
      html_ru: '',
      html_en: '',
    },
    {
      id: 'materials-notes',
      name: 'Разрешительная документация (блок с пояснением)',
      type: 'html',
      is_active: true,
      container: 'wrap',
      padding_top: 10,
      padding_bottom: 36,
      html_ru: `<div class="notes">
  <b>Примечание.</b> Пример пояснительного блока под списком материалов.
</div>`,
      html_en: `<div class="notes">
  <b>Note.</b> Sample explanatory block under the materials list.
</div>`,
    },
  ],

  cart: [
    {
      id: 'cart-nav',
      name: 'Блок навигации',
      type: 'html',
      is_active: true,
      container: 'full',
      padding_top: 46,
      padding_bottom: 26,
      html_ru: `<div class="pagehead">
  <div class="wrap">
    <div class="crumb"><a href="/">Главная</a> / <span>Корзина</span></div>
    <div class="kick">🛒</div>
    <h1>Корзина</h1>
    <p>Список выбранных товаров для заказа.</p>
  </div>
</div>`,
      html_en: `<div class="pagehead">
  <div class="wrap">
    <div class="crumb"><a href="/">Home</a> / <span>Cart</span></div>
    <div class="kick">🛒</div>
    <h1>Cart</h1>
    <p>Selected items ready for order.</p>
  </div>
</div>`,
    },
    {
      id: 'cart-main',
      name: 'Список товаров в корзине',
      type: 'cart_view',
      is_active: true,
      container: 'wrap',
      padding_top: 24,
      padding_bottom: 40,
      html_ru: '',
      html_en: '',
    },
  ],

  checkout: [
    {
      id: 'checkout-nav',
      name: 'Блок навигации',
      type: 'html',
      is_active: true,
      container: 'full',
      padding_top: 46,
      padding_bottom: 26,
      html_ru: `<div class="pagehead">
  <div class="wrap">
    <div class="crumb"><a href="/">Главная</a> / <a href="/cart">Корзина</a> / <span>Оформление</span></div>
    <div class="kick">🛒</div>
    <h1>Оформление заказа</h1>
    <p>Заполните контактные данные для формирования заявки.</p>
  </div>
</div>`,
      html_en: `<div class="pagehead">
  <div class="wrap">
    <div class="crumb"><a href="/">Home</a> / <a href="/cart">Cart</a> / <span>Checkout</span></div>
    <div class="kick">🛒</div>
    <h1>Order checkout</h1>
    <p>Fill in contact details to place your request.</p>
  </div>
</div>`,
    },
    {
      id: 'checkout-main',
      name: 'Форма оформления заказа',
      type: 'checkout_view',
      is_active: true,
      container: 'wrap',
      padding_top: 24,
      padding_bottom: 40,
      html_ru: '',
      html_en: '',
    },
  ],
};

export function getDefaultSections(page: string): PageSection[] {
  const list = DEFAULT_PAGE_SECTIONS[page];
  if (!list) return [];
  return JSON.parse(JSON.stringify(list));
}
