'use client';
import Link from 'next/link';
import ChromeRenderer from './ChromeRenderer';
import type { ChromeBlock, ContactInfo } from '@/lib/types';

export default function Footer({
  contacts,
  blocks,
}: {
  contacts: ContactInfo;
  blocks: ChromeBlock[];
}) {
  const copy = blocks.filter((b) => b.is_active && b.kind === 'copyright');
  const body = blocks.filter((b) => b.is_active && b.kind !== 'copyright');

  return (
    <footer>
      <div className="wrap">
        <div className="foot-grid chrome-blocks chrome-foot">
          <ChromeRenderer blocks={body} contacts={contacts} />
        </div>
        <div className="fcopy chrome-blocks chrome-copy">
          <ChromeRenderer blocks={copy} contacts={contacts} />
          <span>
            <Link href="/admin">Админ-панель</Link>
          </span>
        </div>
      </div>
    </footer>
  );
}
