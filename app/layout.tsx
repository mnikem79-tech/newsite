import type { Metadata, Viewport } from 'next';
import './globals.css';
import { CartProvider } from '@/components/CartProvider';
import RevealAll from '@/components/RevealAll';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { getContacts, getSite, getChromeBlocks, getMenuPages } from '@/lib/content';
import type { ChromeBlock, PageItem } from '@/lib/types';

export const metadata: Metadata = {
  title: 'Новый сайт',
  description:
    'Демонстрационный сайт на готовом движке: каталог товаров, заказы, конструктор страниц и уведомления.',
};

export const viewport: Viewport = { themeColor: '#0a1120' };

const FALLBACK_SITE = {
  topbar_ru: 'Пн–Пт 9:00–18:00  ·  +7 (000) 000-00-00  ·  info@newsite.nail-app.ru',
  footer_ru: '© 2026 Новый сайт',
  telegram_url: '',
};
const FALLBACK_CONTACTS = {
  phone: '+7 (000) 000-00-00',
  phone_href: 'tel:+70000000000',
  email: 'info@newsite.nail-app.ru',
  address_ru: 'Адрес уточняется',
  hours_ru: 'Пн–Пт 9:00–18:00',
  telegram_url: '',
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  let site: typeof FALLBACK_SITE = FALLBACK_SITE;
  let contacts: typeof FALLBACK_CONTACTS = FALLBACK_CONTACTS;
  let headerBlocks: ChromeBlock[] = [];
  let footerBlocks: ChromeBlock[] = [];
  let menuPages: PageItem[] = [];
  try {
    [site, contacts, headerBlocks, footerBlocks, menuPages] = await Promise.all([
      getSite(),
      getContacts(),
      getChromeBlocks('header'),
      getChromeBlocks('footer'),
      getMenuPages(),
    ]);
  } catch (e) {
    console.error('DB unavailable, using fallbacks:', e);
  }
  if (!headerBlocks.length) headerBlocks = (await import('@/lib/chrome')).defaultChromeBlocks('header');
  if (!footerBlocks.length) footerBlocks = (await import('@/lib/chrome')).defaultChromeBlocks('footer');
  return (
    <html lang="ru">
      <body>
        <CartProvider>
          <Header site={site} contacts={contacts} blocks={headerBlocks} pages={menuPages} />
          <main>{children}</main>
          <Footer site={site} contacts={contacts} blocks={footerBlocks} />
          <RevealAll />
        </CartProvider>
      </body>
    </html>
  );
}
