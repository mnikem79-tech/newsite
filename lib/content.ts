import { getContentCached, getPagesCached } from './db';
import seed from './seed-data';
import { getDefaultSections } from './default-sections';
import type {
  AboutIntro, ChromeBlock, ContactInfo, HomeHero, MaterialItem, PageSection, PageItem, ServiceItem, SiteSettings,
} from './types';
import { sanitizeChrome } from './chrome';

const D = seed.contentDefaults as {
  home_hero: HomeHero;
  about_intro: AboutIntro;
  contacts: ContactInfo;
  site: SiteSettings;
  materials: MaterialItem[];
  services: ServiceItem[];
};

export async function getHero(): Promise<HomeHero> {
  const d = (await getContentCached('home_hero')) as Partial<HomeHero> | null;
  return { ...D.home_hero, ...(d ?? {}) };
}

export async function getAboutIntro(): Promise<AboutIntro> {
  const d = (await getContentCached('about_intro')) as Partial<AboutIntro> | null;
  return { ...D.about_intro, ...(d ?? {}) };
}

export async function getContacts(): Promise<ContactInfo> {
  const d = (await getContentCached('contacts')) as Partial<ContactInfo> | null;
  return { ...D.contacts, ...(d ?? {}) };
}

export async function getSite(): Promise<SiteSettings> {
  const d = (await getContentCached('site')) as Partial<SiteSettings> | null;
  return { ...D.site, ...(d ?? {}) };
}

export async function getMaterials(): Promise<MaterialItem[]> {
  const d = (await getContentCached('materials')) as MaterialItem[] | null;
  return d?.length ? d : D.materials;
}

export async function getServices(): Promise<ServiceItem[]> {
  const d = (await getContentCached('services')) as ServiceItem[] | null;
  return d?.length ? d : D.services;
}

const FALLBACK_PAGES: PageItem[] = [
  { id: -1, slug: 'about', title_ru: 'О компании', is_active: true, in_menu: true, position: 1, is_system: false },
  { id: -2, slug: 'production', title_ru: 'Производство', is_active: true, in_menu: true, position: 2, is_system: false },
  { id: -3, slug: 'services', title_ru: 'Услуги', is_active: true, in_menu: true, position: 3, is_system: false },
  { id: -4, slug: 'materials', title_ru: 'Материалы', is_active: true, in_menu: true, position: 4, is_system: false },
  { id: -5, slug: 'contacts', title_ru: 'Контакты', is_active: true, in_menu: true, position: 5, is_system: false },
];

/** All pages, active first — for the admin page switcher. */
export async function getPages(): Promise<PageItem[]> {
  const d = (await getPagesCached()) as PageItem[] | null;
  if (Array.isArray(d) && d.length) return d;
  return FALLBACK_PAGES;
}

/** Pages shown in the site menu. */
export async function getMenuPages(): Promise<PageItem[]> {
  const all = await getPages();
  const menu = all.filter((p) => p.is_active && p.in_menu);
  return menu.length ? menu : FALLBACK_PAGES.filter((p) => p.in_menu);
}

/** Blocks of the flexible header / footer. */
export async function getChromeBlocks(area: 'header' | 'footer'): Promise<ChromeBlock[]> {
  const d = await getContentCached(area);
  return sanitizeChrome(d, area);
}

export async function getPageSections(page: string): Promise<PageSection[]> {
  const key = `sections_${page}`;
  try {
    const d = (await getContentCached(key)) as PageSection[] | null;
    if (d && Array.isArray(d) && d.length > 0) {
      if (page !== 'home') {
        const navId = `${page}-nav`;
        const hasNav = d.some((s) => s.id === navId || s.name === 'Блок навигации');
        if (!hasNav) {
          const defNav = getDefaultSections(page).find((s) => s.id === navId);
          if (defNav) return [defNav, ...d];
        } else {
          d.forEach((s) => {
            if (s.id === navId || s.name === 'Блок навигации') {
              if (s.container === undefined) s.container = 'full';
              if (s.padding_top === undefined) s.padding_top = 46;
              if (s.padding_bottom === undefined) s.padding_bottom = 26;
            }
          });
        }
      }
      return d;
    }
  } catch (err) {
    console.error(`Failed to get sections for ${page}:`, err);
  }
  return getDefaultSections(page);
}
