'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { ChromeBlock, ContactInfo, PageItem, SiteSettings } from '@/lib/types';
import { kindDef } from '@/lib/chrome';

function parseLines(lines?: string): { text: string; href: string }[] {
  if (!lines) return [];
  return lines
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean)
    .map((l) => {
      const [t, h] = l.split('|');
      return { text: (t ?? '').trim(), href: (h ?? '').trim() || '#' };
    })
    .filter((l) => l.text);
}

export default function ChromeRenderer({
  blocks,
  site,
  contacts,
  pages = [],
}: {
  blocks: ChromeBlock[];
  site: SiteSettings;
  contacts: ContactInfo;
  pages?: PageItem[];
}) {
  // меню строится из страниц, которые есть в базе и включены в меню
  const menuItems = pages
    .filter((p) => p.is_active && p.in_menu && p.slug !== 'home')
    .map((p) => ({
      href: p.slug === 'home' ? '/' : `/${p.slug}`,
      label: site[`nav_${p.slug}_ru`] || p.title_ru,
    }));
  const pathname = usePathname();
  const isActive = (href: string) => (href === '/' ? pathname === '/' : pathname.startsWith(href));

  return (
    <>
      {blocks
        .filter((b) => b.is_active)
        .map((b) => {
          const def = kindDef(b.kind);
          const cls = `cb cb-${b.kind}`;

          if (b.kind === 'topbar') {
            if (!b.text?.trim()) return null;
            return (
              <div className={cls} key={b.id}>
                <span>{b.text}</span>
              </div>
            );
          }

          if (b.kind === 'logo') {
            return (
              <div className={cls} key={b.id}>
                <Link href="/" className="brand" title="Новый сайт">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/img-1.png" alt="Новый сайт" className="logo-img" width={1121} height={272} />
                  {b.text?.trim() && (
                    <span className="name">
                      <span className="t">{b.text}</span>
                    </span>
                  )}
                </Link>
              </div>
            );
          }

          if (b.kind === 'menu') {
            return (
              <div className={cls} key={b.id}>
                <nav className="menu">
                  {menuItems.map((n) => (
                    <Link key={n.href} href={n.href} className={isActive(n.href) ? 'active' : ''}>
                      {n.label}
                    </Link>
                  ))}
                </nav>
              </div>
            );
          }

          if (b.kind === 'phone') {
            if (!contacts.phone) return null;
            return (
              <div className={cls} key={b.id}>
                <a href={contacts.phone_href} className="cb-strong">
                  {contacts.phone}
                </a>
              </div>
            );
          }

          if (b.kind === 'email') {
            if (!contacts.email) return null;
            return (
              <div className={cls} key={b.id}>
                <a href={`mailto:${contacts.email}`}>{contacts.email}</a>
              </div>
            );
          }

          if (b.kind === 'address') {
            if (!contacts.address_ru) return null;
            return (
              <div className={cls} key={b.id}>
                <span>{contacts.address_ru}</span>
              </div>
            );
          }

          if (b.kind === 'hours') {
            if (!contacts.hours_ru) return null;
            return (
              <div className={cls} key={b.id}>
                <span>{contacts.hours_ru}</span>
              </div>
            );
          }

          if (b.kind === 'contacts') {
            return (
              <div className={cls} key={b.id}>
                {b.text?.trim() && <h4>{b.text}</h4>}
                <ul>
                  {contacts.phone && (
                    <li>
                      <a href={contacts.phone_href} className="cb-strong">
                        {contacts.phone}
                      </a>
                    </li>
                  )}
                  {contacts.email && (
                    <li>
                      <a href={`mailto:${contacts.email}`}>{contacts.email}</a>
                    </li>
                  )}
                  {contacts.address_ru && <li>{contacts.address_ru}</li>}
                  {contacts.hours_ru && <li>{contacts.hours_ru}</li>}
                  {contacts.telegram_url && (
                    <li>
                      <a href={contacts.telegram_url} target="_blank" rel="noreferrer">
                        Telegram ↗
                      </a>
                    </li>
                  )}
                </ul>
              </div>
            );
          }

          if (b.kind === 'socials') {
            const url = site.telegram_url || contacts.telegram_url;
            if (!url) return null;
            return (
              <div className={cls} key={b.id}>
                <a href={url} target="_blank" rel="noreferrer">
                  <span className="dot">✈</span> {b.text?.trim() || 'Telegram'}
                </a>
              </div>
            );
          }

          if (b.kind === 'button') {
            if (!b.text?.trim()) return null;
            const href = b.href?.trim() || '/contacts';
            const ext = href.startsWith('http');
            return (
              <div className={cls} key={b.id}>
                <Link href={href} className="btn primary" {...(ext ? { target: '_blank', rel: 'noreferrer' } : {})}>
                  <span>{b.text}</span>
                </Link>
              </div>
            );
          }

          if (b.kind === 'links') {
            const items = parseLines(b.lines);
            return (
              <div className={cls} key={b.id}>
                {b.text?.trim() && <h4>{b.text}</h4>}
                <ul>
                  {items.map((l, i) => (
                    <li key={i}>
                      <Link href={l.href}>{l.text}</Link>
                    </li>
                  ))}
                </ul>
              </div>
            );
          }

          if (b.kind === 'copyright') {
            if (!b.text?.trim()) return null;
            return (
              <div className={cls} key={b.id}>
                <span>{b.text}</span>
              </div>
            );
          }

          // kind === 'html'
          if (!b.html_ru?.trim()) return null;
          return (
            <div className={cls} key={b.id} dangerouslySetInnerHTML={{ __html: b.html_ru }} />
          );
        })}
    </>
  );
}
