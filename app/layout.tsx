import type { Metadata, Viewport } from 'next';
import './globals.css';
import { LangProvider } from '@/components/L';
import { CartProvider } from '@/components/CartProvider';
import RevealAll from '@/components/RevealAll';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { getContacts, getSite } from '@/lib/content';

export const metadata: Metadata = {
  title: 'НПО КИПРОЛ — Компенсация реактивной мощности и энергооборудование',
  description:
    'Научно-производственное объединение КИПРОЛ: конденсаторные установки 230 В–220 кВ, реакторы, преобразователи, возобновляемые источники, погрузчики и складская техника, запасные части, технические жидкости. Тольятти.',
};

export const viewport: Viewport = { themeColor: '#0a1120' };

const FALLBACK_SITE = {
  topbar_ru: 'Пн–Пт 7:00–17:00 МСК  ·  +7 (927) 212-39-34  ·  info@kiprol.ru',
  topbar_en: 'Mon–Fri 7:00–17:00 MSK  ·  +7 (927) 212-39-34  ·  info@kiprol.ru',
  footer_ru: '© 2024 ТМ KIPROL.RU ‖ КИПРОЛ.РФ',
  footer_en: '© 2024 KIPROL.RU',
  telegram_url: 'https://t.me/+ib13aD-uEgJlYmUy',
};
const FALLBACK_CONTACTS = {
  phone: '+7 (927) 212-39-34',
  phone_href: 'tel:+79272123934',
  email: 'info@kiprol.ru',
  address_ru: 'Россия, Самарская область, г. Тольятти, 445045',
  address_en: 'Russia, Samara region, Tolyatti, 445045',
  hours_ru: 'Пн–Пт 7:00–17:00 МСК',
  hours_en: 'Mon–Fri 7:00–17:00 MSK',
  telegram_url: 'https://t.me/+ib13aD-uEgJlYmUy',
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  let site: typeof FALLBACK_SITE = FALLBACK_SITE;
  let contacts: typeof FALLBACK_CONTACTS = FALLBACK_CONTACTS;
  try {
    [site, contacts] = await Promise.all([getSite(), getContacts()]);
  } catch (e) {
    console.error('DB unavailable, using fallbacks:', e);
  }
  return (
    <html lang="ru">
      <body>
        <LangProvider>
          <CartProvider>
            <Header site={site} contacts={contacts} />
            <main>{children}</main>
            <Footer site={site} contacts={contacts} />
            <RevealAll />
          </CartProvider>
        </LangProvider>
      </body>
    </html>
  );
}
