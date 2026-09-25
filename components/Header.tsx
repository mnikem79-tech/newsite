'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { useCart } from './CartProvider';
import type { ContactInfo, SiteSettings } from '@/lib/types';

const DEFAULT_NAV = [
  { key: 'home', href: '/', ru: 'Главная' },
  { key: 'about', href: '/about', ru: 'О нас' },
  { key: 'catalog', href: '/catalog', ru: 'Каталог' },
  { key: 'production', href: '/production', ru: 'Производство' },
  { key: 'services', href: '/services', ru: 'Услуги' },
  { key: 'materials', href: '/materials', ru: 'Материалы' },
  { key: 'contacts', href: '/contacts', ru: 'Контакты' },
];

export default function Header({ site, contacts }: { site: SiteSettings; contacts: ContactInfo }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const { count } = useCart();

  const isActive = (href: string) => (href === '/' ? pathname === '/' : pathname.startsWith(href));

  return (
    <>
      <div className="topbar">
        <div className="wrap">
          <span>{site.topbar_ru}</span>
          <div className="tb-right">
            <a href={contacts.telegram_url} target="_blank" rel="noreferrer">
              <span className="dot">✈</span> Telegram-канал
            </a>
          </div>
        </div>
      </div>
      <header>
        <div className="wrap nav">
          <Link href="/" className="brand" onClick={() => setOpen(false)} title="Новый сайт">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/img-1.png" alt="Новый сайт" className="logo-img" width={1121} height={272} />
          </Link>
          <nav className={`menu ${open ? 'open' : ''}`}>
            {DEFAULT_NAV.map((n) => (
              <Link key={n.href} href={n.href} className={isActive(n.href) ? 'active' : ''} onClick={() => setOpen(false)}>
                {site[`nav_${n.key}_ru`] || n.ru}
              </Link>
            ))}
          </nav>
          <div className="nav-right">
            <Link href="/cart" className={`cartlink ${isActive('/cart') ? 'active' : ''}`} aria-label="Корзина" onClick={() => setOpen(false)}>
              <span aria-hidden>🛒</span>
              {count > 0 && <span className="badge-n">{count}</span>}
            </Link>
            <button className="burger" onClick={() => setOpen((v) => !v)} aria-label="menu">
              {open ? '✕' : '☰'}
            </button>
          </div>
        </div>
      </header>
    </>
  );
}
