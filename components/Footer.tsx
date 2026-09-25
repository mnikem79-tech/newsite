'use client';
import Link from 'next/link';
import { L, useLang } from './L';
import type { ContactInfo, SiteSettings } from '@/lib/types';

const CATS = [
  { href: '/catalog', ru: 'Демо-раздел 1', en: 'Demo section 1' },
  { href: '/catalog', ru: 'Демо-раздел 2', en: 'Demo section 2' },
];

export default function Footer({ site, contacts }: { site: SiteSettings; contacts: ContactInfo }) {
  const { lang } = useLang();
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
              <L
                ru="Демонстрационный сайт: каталог товаров, заказы и конструктор страниц."
                en="Demo website: product catalog, orders and page builder."
              />
            </p>
          </div>
          <div>
            <h4><L ru="Навигация" en="Navigation" /></h4>
            <ul>
              <li><Link href="/about"><L ru={site.nav_about_ru || "О компании"} en={site.nav_about_en || "About the company"} /></Link></li>
              <li><Link href="/production"><L ru={site.nav_production_ru || "Производство"} en={site.nav_production_en || "Production"} /></Link></li>
              <li><Link href="/services"><L ru={site.nav_services_ru || "Услуги"} en={site.nav_services_en || "Services"} /></Link></li>
              <li><Link href="/materials"><L ru={site.nav_materials_ru || "Материалы и документация"} en={site.nav_materials_en || "Materials & documentation"} /></Link></li>
              <li><Link href="/contacts"><L ru={site.nav_contacts_ru || "Контакты"} en={site.nav_contacts_en || "Contacts"} /></Link></li>
            </ul>
          </div>
          <div>
            <h4><L ru="Каталог" en="Catalog" /></h4>
            <ul>
              {CATS.map((c, i) => (
                <li key={i}><Link href={c.href}><L ru={c.ru} en={c.en} /></Link></li>
              ))}
            </ul>
          </div>
          <div>
            <h4><L ru="Контакты" en="Contacts" /></h4>
            <ul>
              <li><a href={contacts.phone_href} style={{ color: 'var(--txt)', fontWeight: 600 }}>{contacts.phone}</a></li>
              <li><a href={`mailto:${contacts.email}`}>{contacts.email}</a></li>
              <li><L ru={contacts.address_ru} en={contacts.address_en} /></li>
              <li><L ru={contacts.hours_ru} en={contacts.hours_en} /></li>
              <li><a href={contacts.telegram_url} target="_blank" rel="noreferrer">Telegram ↗</a></li>
            </ul>
          </div>
        </div>
        <div className="fcopy">
          <span><L ru={site.footer_ru} en={site.footer_en} /></span>
          <span style={{ opacity: 0.55, fontSize: 12 }}><L ru="обновление от 25.09.2026" en="updated 25.09.2026" /></span>
          <span><Link href="/admin"><L ru="Админ-панель" en="Admin panel" /></Link></span>
        </div>
      </div>
    </footer>
  );
}
