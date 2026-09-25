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
      ⚡ Научно-производственное объединение
    </div>
    <h1>
      Компенсация реактивной мощности <span>и надёжное энергооборудование</span>
    </h1>
    <p>
      Изготавливаем и поставляем энергетическое оборудование от 230 В до 220 кВ, импортируем продукцию из дружественных стран и оказываем инженерные услуги — от расчётов до пусконаладки.
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
        <div class="n">230 <b>В</b> – <b>220</b> <b>кВ</b></div>
        <div class="l">Диапазон напряжений конденсаторных установок</div>
      </div>
      <div class="stat">
        <div class="n">9</div>
        <div class="l">Разделов каталога продукции</div>
      </div>
      <div class="stat">
        <div class="n">5+</div>
        <div class="l">Видов инженерных услуг</div>
      </div>
    </div>
  </div>
</div>`,
      html_en: `<div class="hero align-top" style="min-height: 540px;">
  <div class="bgimg" style="background-image: url('/img-2.jpg');"></div>
  <div class="wrap" style="padding-top: 36px; padding-bottom: 50px;">
    <div class="kicker">
      ⚡ Research & Production Association
    </div>
    <h1>
      Reactive power compensation <span>and reliable power equipment</span>
    </h1>
    <p>
      We manufacture and supply power equipment from 230 V to 220 kV, import products from friendly countries and provide engineering services — from calculations to commissioning.
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
        <div class="n">230 <b>V</b> – <b>220</b> <b>kV</b></div>
        <div class="l">Capacitor unit voltage range</div>
      </div>
      <div class="stat">
        <div class="n">9</div>
        <div class="l">Product catalog sections</div>
      </div>
      <div class="stat">
        <div class="n">5+</div>
        <div class="l">Engineering service types</div>
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
    <img src="/img-3.jpg" alt="НПО КИПРОЛ" />
    <div class="cap">Инженерия и контроль качества</div>
  </div>
  <div>
    <div class="kick">О нас</div>
    <h2 class="sec">Научно-производственное объединение</h2>
    <p class="lead" style="margin-top: 16px;">
      НПО КИПРОЛ предоставляет высококачественное и надёжное оборудование по минимально возможным ценам и срокам благодаря профессиональному и честному сотрудничеству с заказчиками и поставщиками.
    </p>
    <div class="feat-list" style="margin-top: 20px;">
      <div class="feat">
        <div class="chk">✓</div>
        <p>Каталог продукции от высоковольтных конденсаторных установок до складской техники.</p>
      </div>
      <div class="feat">
        <div class="chk">✓</div>
        <p>Инженерные услуги: расчёты, моделирование, энергоаудит, пусконаладка.</p>
      </div>
      <div class="feat">
        <div class="chk">✓</div>
        <p>Производство конденсаторов и реакторов по техническим требованиям заказчика.</p>
      </div>
    </div>
  </div>
</div>`,
      html_en: `<div class="two">
  <div class="figure">
    <img src="/img-3.jpg" alt="KIPROL" />
    <div class="cap">Engineering & quality control</div>
  </div>
  <div>
    <div class="kick">About us</div>
    <h2 class="sec">Research & Production Association</h2>
    <p class="lead" style="margin-top: 16px;">
      KIPROL provides high-quality, reliable equipment at the lowest possible prices and lead times thanks to professional, honest cooperation with customers and suppliers.
    </p>
    <div class="feat-list" style="margin-top: 20px;">
      <div class="feat">
        <div class="chk">✓</div>
        <p>Product catalog from high-voltage capacitor units to warehouse machinery.</p>
      </div>
      <div class="feat">
        <div class="chk">✓</div>
        <p>Engineering services: calculations, simulation, energy audit, commissioning.</p>
      </div>
      <div class="feat">
        <div class="chk">✓</div>
        <p>Production of capacitors and reactors to customer specifications.</p>
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
    <h3>Нужен подбор оборудования под Ваш объект?</h3>
    <p>Пришлите ТЗ или опишите задачу — вернёмся с решением и коммерческим предложением.</p>
  </div>
  <a href="/contacts" class="btn primary">Связаться с нами →</a>
</div>`,
      html_en: `<div class="cta-strip">
  <div>
    <h3>Need equipment selected for your site?</h3>
    <p>Send us your specs or describe the task — we will get back with a solution and a quotation.</p>
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
    <p>Научно-производственное объединение КИПРОЛ</p>
  </div>
</div>`,
      html_en: `<div class="pagehead">
  <div class="wrap">
    <div class="crumb"><a href="/">Home</a> / <span>About</span></div>
    <div class="kick">About us</div>
    <h1>About the company</h1>
    <p>KIPROL Research & Production Association</p>
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
    <h2 class="sec">Научно-производственное объединение КИПРОЛ</h2>
    <p class="lead" style="margin-top: 16px;">
      Разработка, производство и поставка современного электрооборудования для компенсации реактивной мощности и фильтрации гармоник в промышленных и распределительных сетях 0.4–220 кВ.
    </p>
    <div class="feat-list" style="margin-top: 22px;">
      <div class="feat"><div class="chk">✓</div><p>Работаем только с проверенными поставщиками из дружественных стран.</p></div>
      <div class="feat"><div class="chk">✓</div><p>Высококачественное и надёжное оборудование по минимально возможным ценам и срокам.</p></div>
      <div class="feat"><div class="chk">✓</div><p>Большой опыт в энергетике: компенсация реактивной мощности, гармонические искажения, преобразовательная техника.</p></div>
    </div>
  </div>
  <div class="figure">
    <img src="/img-3.jpg" alt="НПО КИПРОЛ" />
    <div class="cap">Специалисты компании</div>
  </div>
</div>`,
      html_en: `<div class="two">
  <div>
    <div class="badge">About company</div>
    <h2 class="sec">KIPROL Research & Production Association</h2>
    <p class="lead" style="margin-top: 16px;">
      Development, manufacturing and supply of modern electrical equipment for reactive power compensation and harmonic filtering in 0.4–220 kV industrial networks.
    </p>
    <div class="feat-list" style="margin-top: 22px;">
      <div class="feat"><div class="chk">✓</div><p>We work only with trusted suppliers from friendly countries.</p></div>
      <div class="feat"><div class="chk">✓</div><p>High-quality, reliable equipment at the lowest possible prices and lead times.</p></div>
      <div class="feat"><div class="chk">✓</div><p>Deep experience in energy: reactive power compensation, harmonic distortion, power conversion.</p></div>
    </div>
  </div>
  <div class="figure">
    <img src="/img-3.jpg" alt="KIPROL specialists" />
    <div class="cap">Company specialists</div>
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
      html_ru: `<div class="shead"><div><h2 class="sec">Сертификаты и декларации</h2></div></div>
<div class="notes">
  Сертификаты и декларации о соответствии на поставляемое оборудование предоставляются по запросу. Мы работаем в полном соответствии с ГОСТ и ТР и сопровождаем поставки полным пакетом разрешительной документации.
</div>`,
      html_en: `<div class="shead"><div><h2 class="sec">Certificates & declarations</h2></div></div>
<div class="notes">
  Certificates and declarations of conformity for supplied equipment are available on request. We fully comply with GOST and technical regulations and provide a complete package of permits with every delivery.
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
  Раздел новостей в разработке. Подписывайтесь на наш Telegram-канал, чтобы быть в курсе новинок продукции и событий компании.
</div>`,
      html_en: `<div class="shead"><div><h2 class="sec">News</h2></div></div>
<div class="notes">
  The news section is under development. Subscribe to our Telegram channel to stay updated on new products and company events.
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
  <div class="card"><div class="chd"><div class="ic">🔆</div><h3>Конденсаторные установки</h3></div><p>УКМ, УКМФ, УК, УКМ58, УКР(Л)56, ФКУ, БСК напряжением от 230 В до 220 кВ.</p></div>
  <div class="card"><div class="chd"><div class="ic">⟳</div><h3>Активные фильтры гармоник</h3></div><p>Устранение высших гармонических искажений от преобразователей и приводной техники.</p></div>
  <div class="card"><div class="chd"><div class="ic">🛡</div><h3>Системы защит БСК</h3></div><p>Реле небалансной защиты и системы управления для батарей статических конденсаторов.</p></div>
</div>`,
      html_en: `<div class="shead"><div><h2 class="sec">Our projects</h2></div></div>
<div class="grid g3">
  <div class="card"><div class="chd"><div class="ic">🔆</div><h3>Capacitor banks</h3></div><p>UKM, UKMF, UK, UKM58, UKR(L)56, FKU, BSK rated 230 V to 220 kV.</p></div>
  <div class="card"><div class="chd"><div class="ic">⟳</div><h3>Active harmonic filters</h3></div><p>Elimination of higher harmonic distortion from converters and drives.</p></div>
  <div class="card"><div class="chd"><div class="ic">🛡</div><h3>Capacitor bank protection</h3></div><p>Unbalance protection relays and control systems for static capacitor banks.</p></div>
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
    <p>От высоковольтного энергооборудования до складской техники и запасных частей. Выберите раздел ниже — на каждой позиции можно оформить заказ или запросить коммерческое предложение.</p>
  </div>
</div>`,
      html_en: `<div class="pagehead">
  <div class="wrap">
    <div class="crumb"><a href="/">Home</a> / <span>Product catalog</span></div>
    <div class="kick">Product catalog</div>
    <h1>Product catalog</h1>
    <p>From high-voltage power equipment to warehouse machinery and spare parts. Choose a section below — every item can be ordered directly or quoted.</p>
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
    <p>Собственное производство и поставки энергооборудования, проверенные годами безаварийной эксплуатации.</p>
  </div>
</div>`,
      html_en: `<div class="pagehead">
  <div class="wrap">
    <div class="crumb"><a href="/">Home</a> / <span>Production</span></div>
    <div class="kick">Production</div>
    <h1>Production</h1>
    <p>Own manufacturing and supply of power equipment proven by years of trouble-free operation.</p>
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
    <div class="badge">Производство по требованиям заказчика</div>
    <h3>Оборудование, изготовленное под Вашу задачу</h3>
    <p>
      Серийные изделия и уникальные решения. Возможна разработка специальных конденсаторов и реакторов по техническим требованиям заказчика.
    </p>
  </div>
</div>`,
      html_en: `<div class="prod-banner" style="background-image: url('/img-3.jpg');">
  <div class="txt">
    <div class="badge">Production to customer requirements</div>
    <h3>Equipment built for your task</h3>
    <p>
      Serial products and custom solutions. Special capacitors and reactors can be developed to customer specifications.
    </p>
  </div>
</div>`,
    },
    {
      id: 'prod-cards',
      name: 'Оборудование ChangRong и Реакторы',
      type: 'html',
      is_active: true,
      container: 'wrap',
      padding_top: 12,
      padding_bottom: 36,
      html_ru: `<div class="grid g2">
  <div class="card">
    <div class="chd">
      <div class="ic">🔧</div>
      <h3>Конденсаторы ChangRong</h3>
    </div>
    <p>
      Силовые электронные плёночные конденсаторы Anhui Chang Rong Electronics Co. Ltd. Полностью автоматизированные линии намотки, напыления, пропитки и испытаний. Более 20 лет опыта.
    </p>
    <div class="feat-list" style="margin-top: 14px;">
      <div class="feat"><div class="chk">✓</div><p>Автоматическая намотка плёнки и резка</p></div>
      <div class="feat"><div class="chk">✓</div><p>Золотое напыление и вакуумная пропитка маслом</p></div>
      <div class="feat"><div class="chk">✓</div><p>Испытания на устойчивость к напряжению и тестирование продукции</p></div>
      <div class="feat"><div class="chk">✓</div><p>Разработка специальных конденсаторов по требованиям заказчика</p></div>
    </div>
  </div>
  <div class="card">
    <div class="chd">
      <div class="ic">⚙️</div>
      <h3>Реакторы и дроссели</h3>
    </div>
    <p>
      Реакторы и дроссели, проверенные годами безаварийной эксплуатации: РТСТ, РТОС, РТЛД, РОЛД, РФСТ, РФОС — токоограничивающие, шунтирующие, фильтровые и демпфирующие.
    </p>
    <div class="feat-list" style="margin-top: 14px;">
      <div class="feat"><div class="chk">✓</div><p>Токоограничивающие (РТСТ, РТОС)</p></div>
      <div class="feat"><div class="chk">✓</div><p>Шунтирующие и фильтровые (РФСТ, РФОС)</p></div>
      <div class="feat"><div class="chk">✓</div><p>Надёжность, подтверждённая эксплуатацией</p></div>
    </div>
  </div>
</div>`,
      html_en: `<div class="grid g2">
  <div class="card">
    <div class="chd">
      <div class="ic">🔧</div>
      <h3>ChangRong capacitors</h3>
    </div>
    <p>
      Power electronic film capacitors by Anhui Chang Rong Electronics Co. Ltd. Fully automated winding, metallization, impregnation and testing lines. Over 20 years of experience.
    </p>
    <div class="feat-list" style="margin-top: 14px;">
      <div class="feat"><div class="chk">✓</div><p>Automatic film winding & cutting</p></div>
      <div class="feat"><div class="chk">✓</div><p>Gold metallization & vacuum oil impregnation</p></div>
      <div class="feat"><div class="chk">✓</div><p>Voltage withstand & product testing</p></div>
      <div class="feat"><div class="chk">✓</div><p>Custom capacitors developed to customer requirements</p></div>
    </div>
  </div>
  <div class="card">
    <div class="chd">
      <div class="ic">⚙️</div>
      <h3>Reactors & chokes</h3>
    </div>
    <p>
      Reactors and chokes proven by years of trouble-free operation: RTST, RTOS, RTLD, ROLD, RFST, RFOS — current-limiting, shunt, filter and damping.
    </p>
    <div class="feat-list" style="margin-top: 14px;">
      <div class="feat"><div class="chk">✓</div><p>Current-limiting (RTST, RTOS)</p></div>
      <div class="feat"><div class="chk">✓</div><p>Shunt & filter (RFST, RFOS)</p></div>
      <div class="feat"><div class="chk">✓</div><p>Reliability proven in operation</p></div>
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
    <p>Комплексные инженерные и сервисные услуги — от НИОКР и расчётов до пусконаладки и бухгалтерского сопровождения.</p>
  </div>
</div>`,
      html_en: `<div class="pagehead">
  <div class="wrap">
    <div class="crumb"><a href="/">Home</a> / <span>Services</span></div>
    <div class="kick">Services</div>
    <h1>Services</h1>
    <p>Comprehensive engineering and service support — from R&D and calculations to commissioning and accounting.</p>
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
    <p>Нормативная база и типовые решения по проектированию и эксплуатации средств компенсации реактивной мощности.</p>
  </div>
</div>`,
      html_en: `<div class="pagehead">
  <div class="wrap">
    <div class="crumb"><a href="/">Home</a> / <span>Materials & documentation</span></div>
    <div class="kick">Materials & documentation</div>
    <h1>Materials & documentation</h1>
    <p>Regulatory basis and standard solutions for design and operation of reactive power compensation equipment.</p>
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
  <b>По запросу</b> Полный пакет разрешительной документации, сертификаты и декларации о соответствии предоставляются вместе с поставкой оборудования.
</div>`,
      html_en: `<div class="notes">
  <b>On request</b> The full package of permits, certificates and declarations of conformity is provided together with the equipment delivery.
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
    <p>Список выбранных товаров и оборудования для заказа.</p>
  </div>
</div>`,
      html_en: `<div class="pagehead">
  <div class="wrap">
    <div class="crumb"><a href="/">Home</a> / <span>Cart</span></div>
    <div class="kick">🛒</div>
    <h1>Cart</h1>
    <p>Selected items and equipment ready for order.</p>
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
    <p>Заполните контактные данные для формирования заявки и коммерческого предложения.</p>
  </div>
</div>`,
      html_en: `<div class="pagehead">
  <div class="wrap">
    <div class="crumb"><a href="/">Home</a> / <a href="/cart">Cart</a> / <span>Checkout</span></div>
    <div class="kick">🛒</div>
    <h1>Order checkout</h1>
    <p>Fill in contact details to receive a commercial proposal and order confirmation.</p>
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
