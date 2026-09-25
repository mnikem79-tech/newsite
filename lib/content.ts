import { getContentCached } from './db';
import seed from './seed-data';
import { getDefaultSections } from './default-sections';
import type {
  AboutIntro, ContactInfo, HomeHero, MaterialItem, PageSection, ServiceItem, SiteSettings,
} from './types';

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
