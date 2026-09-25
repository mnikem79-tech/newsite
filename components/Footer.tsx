'use client';
import Link from 'next/link';
import type { ContactInfo, SiteSettings } from '@/lib/types';

const CATS = [
  { href: '/catalog', ru: 'Демо-раздел 1' },
  { href: '/catalog', ru: 'Демо-раздел 2' },
];

export default function Footer({ site, contacts }: { site: SiteSettings; contacts: ContactInfo }) {
  return (
    <footer>
      <div className="wrap">
        <div className="foot-grid">
          <div>
            <div className="brand-row">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/img-1.png" alt="Новый сайт" style={{ height: 52, width: 'auto' }} />
            </div>
            <p style={{ fontSize: 13.5, color: 'var(--muted)', maxWidth: 300 }}>
              Демонстрационный сайт: каталог товаров, заказы и конструктор страниц.
            </p>
          </div>
          <div>
            <h4>Навигация</h4>
            <ul>
              <li><Link href="/about">{site.nav_about_ru || "О компании"}</Link></li>
              <li><Link href="/production">{site.nav_production_ru || "Производство"}</Link></li>
              <li><Link href="/services">{site.nav_services_ru || "Услуги"}</Link></li>
              <li><Link href="/materials">{site.nav_materials_ru || "Материалы и документация"}</Link></li>
              <li><Link href="/contacts">{site.nav_contacts_ru || "Контакты"}</Link></li>
            </ul>
          </div>
          <div>
            <h4>Каталог</h4>
            <ul>
              {CATS.map((c, i) => (
                <li key={i}><Link href={c.href}>{c.ru}</Link></li>
              ))}
            </ul>
          </div>
          <div>
            <h4>Контакты</h4>
            <ul>
              <li><a href={contacts.phone_href} style={{ color: 'var(--txt)', fontWeight: 600 }}>{contacts.phone}</a></li>
              <li><a href={`mailto:${contacts.email}`}>{contacts.email}</a></li>
              <li>{contacts.address_ru}</li>
              <li>{contacts.hours_ru}</li>
              <li><a href={contacts.telegram_url} target="_blank" rel="noreferrer">Telegram ↗</a></li>
            </ul>
          </div>
        </div>
        <div className="fcopy">
          <span>{site.footer_ru}</span>
          <span style={{ opacity: 0.55, fontSize: 12 }}>обновление от 25.09.2026</span>
          <span><Link href="/admin">Админ-панель</Link></span>
        </div>
      </div>
    </footer>
  );
}
