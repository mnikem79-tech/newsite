'use client';
import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { useCart } from './CartProvider';
import ChromeRenderer from './ChromeRenderer';
import type { ChromeBlock, ContactInfo, PageItem } from '@/lib/types';

export default function Header({
  contacts,
  blocks,
  pages,
}: {
  contacts: ContactInfo;
  blocks: ChromeBlock[];
  pages: PageItem[];
}) {
  const [open, setOpen] = useState(false);
  const { count } = useCart();
  const pathname = usePathname();

  const topbar = blocks.filter((b) => b.is_active && b.kind === 'topbar');
  const nav = blocks.filter((b) => b.is_active && b.kind !== 'topbar');

  return (
    <>
      {topbar.length > 0 && (
        <div className="topbar">
          <div className="wrap chrome-blocks chrome-topbar">
            <ChromeRenderer blocks={topbar} contacts={contacts} />
          </div>
        </div>
      )}
      <header>
        <div className="wrap nav">
          <div className={`chrome-blocks chrome-nav ${open ? 'open' : ''}`}>
            <ChromeRenderer blocks={nav} contacts={contacts} pages={pages} />
          </div>
          <div className="nav-right">
            <a href="/cart" className={`cartlink ${pathname === '/cart' ? 'active' : ''}`} aria-label="Корзина">
              <span aria-hidden>🛒</span>
              {count > 0 && <span className="badge-n">{count}</span>}
            </a>
            <button className="burger" onClick={() => setOpen((v) => !v)} aria-label="menu">
              {open ? '✕' : '☰'}
            </button>
          </div>
        </div>
      </header>
    </>
  );
}
