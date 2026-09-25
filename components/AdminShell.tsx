'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { ReactNode, useState } from 'react';
import { L } from './L';

const LINKS = [
  { href: '/admin', em: '📊', ru: 'Дашборд', en: 'Dashboard', exact: true },
  { href: '/admin/products', em: '📦', ru: 'Товары', en: 'Products', exact: false },
  { href: '/admin/orders', em: '🧾', ru: 'Заказы', en: 'Orders', exact: false },
  { href: '/admin/content', em: '📝', ru: 'Контент', en: 'Content', exact: false },
  { href: '/admin/notifications', em: '🔔', ru: 'Оповещения', en: 'Notifications', exact: false },
  { href: '/admin/users', em: '👥', ru: 'Админы', en: 'Admins', exact: false },
];

export default function AdminShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  const logout = async () => {
    setBusy(true);
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/admin/login');
    router.refresh();
  };

  return (
    <div className="admin-shell">
      <aside className="admin-side">
        <div className="a-brand">
          <div className="lg">Н</div>
          <div className="tt">
            Новый сайт
            <small>админ-панель</small>
          </div>
        </div>
        {LINKS.map((l) => {
          const on = l.exact ? pathname === l.href : pathname.startsWith(l.href);
          return (
            <Link key={l.href} href={l.href} className={`al ${on ? 'on' : ''}`}>
              <span className="em">{l.em}</span>
              <L ru={l.ru} en={l.en} />
            </Link>
          );
        })}
        <div className="a-bottom">
          <Link href="/" className="al">
            <span className="em">🌐</span> <L ru="Открыть сайт" en="Open site" />
          </Link>
          <button
            className="al"
            style={{
              background: 'none',
              border: 0,
              cursor: 'pointer',
              width: '100%',
              textAlign: 'left',
              fontFamily: 'inherit',
            }}
            onClick={logout}
            disabled={busy}
          >
            <span className="em">🚪</span> <L ru="Выйти" en="Log out" />
          </button>
        </div>
      </aside>
      <main className="admin-main">{children}</main>
    </div>
  );
}
