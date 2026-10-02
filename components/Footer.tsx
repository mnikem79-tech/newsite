'use client';
import Link from 'next/link';
import ChromeRenderer from './ChromeRenderer';
import type { ChromeBlock, ContactInfo, SiteSettings } from '@/lib/types';

export default function Footer({
  site,
  contacts,
  blocks,
}: {
  site: SiteSettings;
  contacts: ContactInfo;
  blocks: ChromeBlock[];
}) {
  const copy = blocks.filter((b) => b.is_active && b.kind === 'copyright');
  const body = blocks.filter((b) => b.is_active && b.kind !== 'copyright');

  return (
    <footer>
      <div className="wrap">
        <div className="foot-grid chrome-blocks chrome-foot">
          <ChromeRenderer blocks={body} site={site} contacts={contacts} />
        </div>
        <div className="fcopy chrome-blocks chrome-copy">
          <ChromeRenderer blocks={copy} site={site} contacts={contacts} />
          <span style={{ opacity: 0.55, fontSize: 12 }}>обновление от 25.09.2026</span>
          <span>
            <Link href="/admin">Админ-панель</Link>
          </span>
        </div>
      </div>
    </footer>
  );
}
