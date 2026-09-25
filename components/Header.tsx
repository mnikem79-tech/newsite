'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { L, useLang } from './L';
import { useCart } from './CartProvider';
import type { ContactInfo, SiteSettings } from '@/lib/types';

const DEFAULT_NAV = [
  { key: 'home', href: '/', ru: 'Главная', en: 'Home' },
  { key: 'about', href: '/about', ru: 'О нас', en: 'About' },
  { key: 'catalog', href: '/catalog', ru: 'Каталог', en: 'Catalog' },
  { key: 'production', href: '/production', ru: 'Производство', en: 'Production' },
  { key: 'services', href: '/services', ru: 'Услуги', en: 'Services' },
  { key: 'materials', href: '/materials', ru: 'Материалы', en: 'Materials' },
  { key: 'contacts', href: '/contacts', ru: 'Контакты', en: 'Contacts' },
];

export default function Header({ site, contacts }: { site: SiteSettings; contacts: ContactInfo }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const { lang, setLang } = useLang();
  const { count } = useCart();

  const isActive = (href: string) => (href === '/' ? pathname === '/' : pathname.startsWith(href));

  return (
    <>
      <div className="topbar">
        <div className="wrap">
          <span><L ru={site.topbar_ru} en={site.topbar_en} /></span>
          <div className="tb-right">
            <a href={contacts.telegram_url} target="_blank" rel="noreferrer">
              <span className="dot">✈</span> <L ru="Telegram-канал" en="Telegram channel" />
            </a>
          </div>
        </div>
      </div>
      <header>
        <div className="wrap nav">
          <Link href="/" className="brand" onClick={() => setOpen(false)} title="НПО КИПРОЛ">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/img-1.png" alt="НПО КИПРОЛ" className="logo-img" width={1121} height={272} />
          </Link>
          <nav className={`menu ${open ? 'open' : ''}`}>
            {DEFAULT_NAV.map((n) => {
              const ru = site[`nav_${n.key}_ru`] || n.ru;
              const en = site[`nav_${n.key}_en`] || n.en;
              return (
                <Link key={n.href} href={n.href} className={isActive(n.href) ? 'active' : ''} onClick={() => setOpen(false)}>
                  <L ru={ru} en={en} />
                </Link>
              );
            })}
          </nav>
          <div className="nav-right">
            <Link href="/cart" className={`cartlink ${isActive('/cart') ? 'active' : ''}`} aria-label="Корзина" onClick={() => setOpen(false)}>
              <span aria-hidden>🛒</span>
              {count > 0 && <span className="badge-n">{count}</span>}
            </Link>
            <div className="langbox">
              <button className={lang === 'ru' ? 'on' : ''} onClick={() => setLang('ru')}>RU</button>
              <button className={lang === 'en' ? 'on' : ''} onClick={() => setLang('en')}>EN</button>
            </div>
            <button className="burger" onClick={() => setOpen((v) => !v)} aria-label="menu">
              {open ? '✕' : '☰'}
            </button>
          </div>
        </div>
      </header>
    </>
  );
}
