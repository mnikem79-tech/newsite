import Link from 'next/link';
import { HtmlBlock } from '@/components/HtmlBlock';
import ServicesList from '@/components/ServicesList';
import ContactForm from '@/components/ContactForm';
import YandexMap from '@/components/YandexMap';
import CatalogClient from '@/components/CatalogClient';
import CartView from '@/components/CartView';
import CheckoutForm from '@/components/CheckoutForm';
import { PUBS, PATS } from '@/lib/site-static-data';
import type {
  Category, ContactInfo, HomeHero, MaterialItem, PageSection, Product, ServiceItem,
} from '@/lib/types';

interface Props {
  sections: PageSection[];
  hero?: HomeHero;
  categories?: Category[];
  services?: ServiceItem[];
  materials?: MaterialItem[];
  contacts?: ContactInfo;
  catalogCategories?: Category[];
  catalogProducts?: Product[];
  initialCat?: string;
}

export function SectionRenderer({
  sections,
  hero,
  categories = [],
  services = [],
  materials = [],
  contacts,
  catalogCategories = [],
  catalogProducts = [],
  initialCat = 'all',
}: Props) {
  return (
    <>
      {sections.map((sec, idx) => {
        if (!sec.is_active) return null;

        const isNavSection =
          sec.id.endsWith('-nav') ||
          sec.name === 'Блок навигации' ||
          (typeof sec.html_ru === 'string' && sec.html_ru.includes('pagehead'));

        // Sensible, compact spacing defaults
        const defaultTop = isNavSection ? 46 : idx === 0 ? 28 : 16;
        const defaultBottom = isNavSection ? 26 : idx === sections.length - 1 ? 40 : 16;
        const pt = sec.padding_top != null ? sec.padding_top : defaultTop;
        const pb = sec.padding_bottom != null ? sec.padding_bottom : defaultBottom;

        const sectionStyle: React.CSSProperties = {
          paddingTop: isNavSection ? 0 : pt,
          paddingBottom: isNavSection ? 0 : pb,
          background:
            sec.bg === 'panel'
              ? 'var(--panel)'
              : sec.bg === 'dark'
              ? '#081020'
              : undefined,
          ...(isNavSection
            ? {
                ['--ph-pt' as string]: `${pt}px`,
                ['--ph-pb' as string]: `${pb}px`,
                ['--ph-pt-m' as string]: `${Math.min(pt, 30)}px`,
                ['--ph-pb-m' as string]: `${Math.min(pb, 20)}px`,
              }
            : {}),
        };

        // Custom HTML Block
        if (sec.type === 'html') {
          const containerClass =
            sec.container === 'full'
              ? 'wrap-full'
              : sec.container === 'narrow'
              ? 'wrap wrap-narrow'
              : 'wrap';

          return (
            <section
              key={sec.id}
              className={`site-section ${isNavSection ? 'site-nav-section' : ''}`}
              style={sectionStyle}
            >
              <div className={containerClass}>
                <HtmlBlock html={sec.html_ru} />
              </div>
            </section>
          );
        }

        // Home Hero Banner
        if (sec.type === 'hero') {
          if (sec.html_ru && sec.html_ru.trim()) {
            const sanitizeHero = (raw: string) =>
              raw.replace(/(<div[^>]*class="[^"]*hero[^"]*"[^>]*style="[^"]*?)background-image:\s*url\([^)]+\);?\s*/gi, '$1');

            return (
              <section key={sec.id} className="site-section" style={{ padding: 0 }}>
                <HtmlBlock html={sanitizeHero(sec.html_ru)} />
              </section>
            );
          }
          if (hero) {
            const [before, after] = hero.title_ru.includes('|')
              ? hero.title_ru.split('|')
              : [hero.title_ru, ''];

            return (
              <div className="hero align-top" key={sec.id}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <div className="bgimg" style={{ backgroundImage: "url('/img-2.jpg')" }} />
                <div className="wrap" style={{ paddingTop: 36, paddingBottom: 50 }}>
                  <div className="kicker">
                    ⚡ {hero.kicker_ru}
                  </div>
                  <h1>
                    {before}
                    {after && (
                      <>
                        {' '}
                        <span>{after}</span>
                      </>
                    )}
                  </h1>
                  <p>{hero.subtitle_ru}</p>
                  <div className="cta">
                    <Link href="/catalog" className="btn primary">
                      <span>Смотреть каталог</span> →
                    </Link>
                    <Link href="/contacts" className="btn ghost">
                      Оставить заявку
                    </Link>
                  </div>
                  <div className="stats">
                    <div className="stat">
                      <div className="n">230 <b>В</b> – <b>220</b> <b>кВ</b></div>
                      <div className="l">Диапазон напряжений конденсаторных установок</div>
                    </div>
                    <div className="stat">
                      <div className="n">9</div>
                      <div className="l">Разделов каталога продукции</div>
                    </div>
                    <div className="stat">
                      <div className="n">5+</div>
                      <div className="l">Видов инженерных услуг</div>
                    </div>
                  </div>
                </div>
              </div>
            );
          }
        }

        // Catalog Categories Grid
        if (sec.type === 'catalog_grid') {
          const titleRu = sec.title_ru?.trim() || 'Каталог оборудования';
          const subRu = sec.subtitle_ru?.trim() || 'Разделы каталога и типовые серии';

          return (
            <section key={sec.id} className="site-section" style={sectionStyle}>
              <div className="wrap">
                <div className="shead rv">
                  <div>
                    <div className="kick">Продукция</div>
                    <h2 className="sec">{titleRu}</h2>
                    <p className="lead">{subRu}</p>
                  </div>
                  <Link href="/catalog" className="btn ghost">
                    <span>Весь каталог</span> →
                  </Link>
                </div>
                <div className="grid g3">
                  {categories.map((c) => (
                    <Link key={c.id} href={`/catalog?cat=${c.slug}`} className="card linkcard rv">
                      <div className="chd">
                        <div className="ic">{c.icon}</div>
                        <h3>{c.name_ru}</h3>
                      </div>
                      <p>{c.note_ru ?? ''}</p>
                    </Link>
                  ))}
                </div>
              </div>
            </section>
          );
        }

        // Services List
        if (sec.type === 'services_list') {
          return (
            <section key={sec.id} className="site-section" style={sectionStyle}>
              <div className="wrap">
                <ServicesList services={services} />
              </div>
            </section>
          );
        }

        // Materials List
        if (sec.type === 'materials_list') {
          return (
            <section key={sec.id} className="site-section" style={sectionStyle}>
              <div className="wrap">
                <div className="mlist">
                  {materials.map((m, i) => (
                    <div className="mat rv" key={i}>
                      <div className="code">{m.code}</div>
                      <div>
                        <div className="t">{m.title_ru}</div>
                        <div className="m">{m.std}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          );
        }

        // Publications List
        if (sec.type === 'publications') {
          const titleRu = sec.title_ru?.trim() || 'Публикации';

          return (
            <section key={sec.id} className="site-section" style={sectionStyle}>
              <div className="wrap">
                <div className="shead"><div><h2 className="sec">{titleRu}</h2></div></div>
                {PUBS.map((p, i) => (
                  <div className="pub" key={i}>
                    <div className="n">{i + 1}</div>
                    <div>
                      <div className="t">{p.t}</div>
                      <div className="m">{p.m}</div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          );
        }

        // Patents List
        if (sec.type === 'patents') {
          const titleRu = sec.title_ru?.trim() || 'Патенты и программы для ЭВМ';

          return (
            <section key={sec.id} className="site-section" style={sectionStyle}>
              <div className="wrap">
                <div className="shead"><div><h2 className="sec">{titleRu}</h2></div></div>
                <div className="pat-list">
                  {PATS.map((p, i) => (
                    <div className="pat rv" key={i}>
                      <div className="code">{p.code}</div>
                      <div className="desc">{p.d}</div>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          );
        }

        // Contacts, Map & Feedback Form
        if (sec.type === 'contacts_main' && contacts) {
          return (
            <section key={sec.id} className="site-section" style={sectionStyle}>
              <div className="wrap">
                <div className="contact-grid">
                  <div className="cbox rv">
                    <h3>Контактная информация</h3>
                    <div className="crow">
                      <div className="ic">📞</div>
                      <div>
                        <div className="k">Телефон</div>
                        <div className="v"><a href={contacts.phone_href}>{contacts.phone}</a></div>
                      </div>
                    </div>
                    <div className="crow">
                      <div className="ic">✉</div>
                      <div>
                        <div className="k">E-mail</div>
                        <div className="v"><a href={`mailto:${contacts.email}`}>{contacts.email}</a></div>
                      </div>
                    </div>
                    <div className="crow">
                      <div className="ic">📍</div>
                      <div>
                        <div className="k">Адрес</div>
                        <div className="v">{contacts.address_ru}</div>
                      </div>
                    </div>
                    <div className="crow">
                      <div className="ic">🕐</div>
                      <div>
                        <div className="k">Режим работы</div>
                        <div className="v">{contacts.hours_ru}</div>
                      </div>
                    </div>
                    <div className="crow">
                      <div className="ic">✈</div>
                      <div>
                        <div className="k">Telegram</div>
                        <div className="v"><a href={contacts.telegram_url} target="_blank" rel="noreferrer">{contacts.telegram_url}</a></div>
                      </div>
                    </div>
                  </div>
                  <div className="map rv">
                    <YandexMap
                      center={[53.5372, 49.4086]}
                      zoom={12}
                      title="Новый сайт"
                      address={contacts.address_ru}
                    />
                    <div className="mlabel">
                      <span style={{ fontSize: 18 }}>📍</span>
                      <span><b>Новый сайт</b><br />{contacts.address_ru}</span>
                    </div>
                  </div>
                </div>
                <div className="cbox" style={{ marginTop: 26 }}>
                  <ContactForm />
                </div>
              </div>
            </section>
          );
        }

        // Full Product Catalog View & Filter
        if (sec.type === 'catalog_view') {
          return (
            <section key={sec.id} className="site-section" style={sectionStyle}>
              <div className="wrap">
                <CatalogClient
                  categories={catalogCategories}
                  products={catalogProducts}
                  initialCat={initialCat}
                />
              </div>
            </section>
          );
        }

        // Shopping Cart View
        if (sec.type === 'cart_view') {
          return (
            <section key={sec.id} className="site-section" style={sectionStyle}>
              <div className="wrap">
                <CartView />
              </div>
            </section>
          );
        }

        // Checkout View
        if (sec.type === 'checkout_view') {
          return (
            <section key={sec.id} className="site-section" style={sectionStyle}>
              <div className="wrap">
                <CheckoutForm />
              </div>
            </section>
          );
        }

        return null;
      })}
    </>
  );
}
