import { q } from '@/lib/db';
import { getDefaultSections } from '@/lib/default-sections';
import ContentEditor from './content-editor';
import type { PageSection } from '@/lib/types';

export const dynamic = 'force-dynamic';

async function getKey(key: string): Promise<unknown> {
  try {
    const r = await q('SELECT data FROM page_content WHERE key = $1', [key]);
    return r.rows.length ? r.rows[0].data : null;
  } catch {
    return null;
  }
}

export default async function AdminContent() {
  const [
    home_hero,
    about_intro,
    contacts,
    site,
    materials,
    services,
    sec_home,
    sec_about,
    sec_catalog,
    sec_production,
    sec_services,
    sec_contacts,
    sec_materials,
    sec_cart,
    sec_checkout,
  ] = await Promise.all([
    getKey('home_hero'),
    getKey('about_intro'),
    getKey('contacts'),
    getKey('site'),
    getKey('materials'),
    getKey('services'),
    getKey('sections_home'),
    getKey('sections_about'),
    getKey('sections_catalog'),
    getKey('sections_production'),
    getKey('sections_services'),
    getKey('sections_contacts'),
    getKey('sections_materials'),
    getKey('sections_cart'),
    getKey('sections_checkout'),
  ]);

  const prepareSections = (pageKey: string, raw: unknown): PageSection[] => {
    const list = (raw as PageSection[]) || getDefaultSections(pageKey);
    if (pageKey === 'home') {
      list.forEach((s) => {
        if (s.id === 'home-hero' && (!s.html_ru || !s.html_ru.trim())) {
          const def = getDefaultSections('home').find((d) => d.id === 'home-hero');
          if (def) {
            s.html_ru = def.html_ru;
          }
        }
      });
      return list;
    }

    const navId = `${pageKey}-nav`;
    const hasNav = list.some((s) => s.id === navId || s.name === 'Блок навигации');
    if (!hasNav) {
      const defNav = getDefaultSections(pageKey).find((s) => s.id === navId);
      if (defNav) return [defNav, ...list];
    } else {
      list.forEach((s) => {
        if (s.id === navId || s.name === 'Блок навигации') {
          if (s.container === undefined) s.container = 'full';
          if (s.padding_top === undefined) s.padding_top = 46;
          if (s.padding_bottom === undefined) s.padding_bottom = 26;
        }
      });
    }
    return list;
  };

  const sections: Record<string, PageSection[]> = {
    home: prepareSections('home', sec_home),
    about: prepareSections('about', sec_about),
    catalog: prepareSections('catalog', sec_catalog),
    production: prepareSections('production', sec_production),
    services: prepareSections('services', sec_services),
    contacts: prepareSections('contacts', sec_contacts),
    materials: prepareSections('materials', sec_materials),
    cart: prepareSections('cart', sec_cart),
    checkout: prepareSections('checkout', sec_checkout),
  };

  return (
    <>
      <div className="a-head">
        <div>
          <h1>Управление сайтом и конструктор страниц</h1>
          <div className="sub">
            Редактирование разделов страниц, вставка адаптивного HTML, загрузка картинок и мобильный предпросмотр
          </div>
        </div>
      </div>
      <ContentEditor
        initial={{
          home_hero: (home_hero ?? null) as Record<string, string> | null,
          about_intro: (about_intro ?? null) as Record<string, string> | null,
          contacts: (contacts ?? null) as Record<string, string> | null,
          site: (site ?? null) as Record<string, string> | null,
          materials: (materials ?? null) as unknown[],
          services: (services ?? null) as unknown[],
          sections,
        }}
      />
    </>
  );
}
