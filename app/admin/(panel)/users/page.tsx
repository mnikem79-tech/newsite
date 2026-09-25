import { q } from '@/lib/db';
import { cookies } from 'next/headers';
import { parseSessionToken, SESSION_COOKIE } from '@/lib/auth';
import UsersView, { UserItem } from './users-view';

export const dynamic = 'force-dynamic';

export default async function AdminUsers() {
  const c = await cookies();
  const me = parseSessionToken(c.get(SESSION_COOKIE)?.value);
  const r = await q('SELECT id, email, display_name, role, created_at FROM users ORDER BY id');

  return (
    <>
      <div className="a-head">
        <div>
          <h1>Администраторы сайта</h1>
          <div className="sub">
            Добавление и удаление входов в админку. Главный вход из .env.production работает всегда, даже если удалить всех здесь.
          </div>
        </div>
      </div>

      <UsersView users={r.rows as unknown as UserItem[]} me={me} />
    </>
  );
}
