'use client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export interface UserItem {
  id: number;
  email: string;
  display_name: string | null;
  role: string;
  created_at: string;
}

interface Props {
  users: UserItem[];
  me: number | null;
}

export default function UsersView({ users: initialUsers, me }: Props) {
  const router = useRouter();
  const [users, setUsers] = useState<UserItem[]>(initialUsers);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserItem | null>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);

  const [formEmail, setFormEmail] = useState('');
  const [formName, setFormName] = useState('');
  const [formPass, setFormPass] = useState('');

  const refreshList = async () => {
    const r = await fetch('/api/users');
    const data = await r.json();
    if (Array.isArray(data?.users)) setUsers(data.users);
  };

  const openAddModal = () => {
    setEditingUser(null);
    setFormEmail('');
    setFormName('');
    setFormPass('');
    setErr(null);
    setModalOpen(true);
  };

  const openEditModal = (u: UserItem) => {
    setEditingUser(u);
    setFormEmail(u.email);
    setFormName(u.display_name || '');
    setFormPass('');
    setErr(null);
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser && !formEmail.trim()) {
      setErr('Пожалуйста, укажите email');
      return;
    }
    if (!editingUser && formPass.length < 8) {
      setErr('Пароль: минимум 8 символов');
      return;
    }
    if (editingUser && formPass !== '' && formPass.length < 8) {
      setErr('Пароль: минимум 8 символов (или оставьте пустым, чтобы не менять)');
      return;
    }
    setBusy(true);
    setErr(null);

    try {
      const url = editingUser ? `/api/users/${editingUser.id}` : '/api/users';
      const method = editingUser ? 'PATCH' : 'POST';
      const payload: Record<string, string> = editingUser
        ? { display_name: formName.trim(), ...(formPass !== '' ? { password: formPass } : {}) }
        : { email: formEmail.trim(), display_name: formName.trim(), password: formPass };

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Ошибка при сохранении');

      setOk(editingUser ? 'Данные администратора обновлены!' : 'Новый администратор добавлен!');
      setTimeout(() => setOk(null), 3000);
      setModalOpen(false);
      router.refresh();
      await refreshList();
    } catch (ex) {
      setErr(ex instanceof Error ? ex.message : String(ex));
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = async (u: UserItem) => {
    if (u.id === me) {
      alert('Нельзя удалить себя — вы сейчас вошли под этой учётной записью.');
      return;
    }
    if (!confirm(`Удалить администратора «${u.email}»? Он больше не сможет войти.`)) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/users/${u.id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Ошибка при удалении');
      setUsers((prev) => prev.filter((x) => x.id !== u.id));
      setOk(`Администратор «${u.email}» удалён`);
      setTimeout(() => setOk(null), 3000);
      router.refresh();
    } catch (ex) {
      alert(ex instanceof Error ? ex.message : String(ex));
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      {err && <div className="alert err" style={{ marginBottom: 16 }}>{err}</div>}
      {ok && <div className="alert ok" style={{ marginBottom: 16 }}>{ok}</div>}

      <div className="a-head">
        <div>
          <h2 style={{ fontSize: 20, margin: 0 }}>Список входов ({users.length})</h2>
          <div className="sub">Каждый администратор входит со своим email и паролем</div>
        </div>
        <button className="btn primary sm" onClick={openAddModal}>
          + Добавить админа
        </button>
      </div>

      <div className="atable-wrap">
        <table className="atable">
          <thead>
            <tr>
              <th>Email</th>
              <th>Имя</th>
              <th>Роль</th>
              <th>Создан</th>
              <th style={{ width: 200 }}></th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id}>
                <td>
                  <div style={{ fontWeight: 600 }}>{u.email}</div>
                  {u.id === me && <span className="st done">это вы</span>}
                </td>
                <td className="muted">{u.display_name || '—'}</td>
                <td><span className="st done">{u.role || 'admin'}</span></td>
                <td className="muted">
                  {u.created_at ? new Date(u.created_at).toLocaleDateString('ru-RU') : '—'}
                </td>
                <td>
                  <div className="act">
                    <button type="button" className="mini-btn" onClick={() => openEditModal(u)}>
                      ✏️ Изменить
                    </button>
                    <button
                      type="button"
                      className="mini-btn red"
                      onClick={() => handleDelete(u)}
                      title="Удалить"
                    >
                      🗑️
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr>
                <td colSpan={5} className="muted" style={{ textAlign: 'center', padding: 24 }}>
                  Пока никого нет — нажмите «Добавить админа»
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {modalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.7)',
            backdropFilter: 'blur(4px)',
            display: 'grid',
            placeItems: 'center',
            zIndex: 100,
            padding: 20,
          }}
          onClick={() => setModalOpen(false)}
        >
          <div
            className="a-card"
            style={{ width: '100%', maxWidth: 520 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
              <h3 style={{ margin: 0, fontSize: 18 }}>
                {editingUser ? `Изменение: ${editingUser.email}` : 'Новый администратор'}
              </h3>
              <button className="mini-btn red" onClick={() => setModalOpen(false)}>✕</button>
            </div>

            <form onSubmit={handleSave}>
              {!editingUser && (
                <div className="field" style={{ marginBottom: 14 }}>
                  <label>Email для входа *</label>
                  <input
                    type="email"
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    placeholder="admin2@example.com"
                    required
                  />
                </div>
              )}

              <div className="field" style={{ marginBottom: 14 }}>
                <label>Отображаемое имя</label>
                <input
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="Например: Иван"
                />
              </div>

              <div className="field" style={{ marginBottom: 18 }}>
                <label>{editingUser ? 'Новый пароль (пусто — не менять)' : 'Пароль (минимум 8 символов) *'}</label>
                <input
                  type="password"
                  value={formPass}
                  onChange={(e) => setFormPass(e.target.value)}
                  placeholder="••••••••"
                  required={!editingUser}
                  minLength={editingUser ? undefined : 8}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, paddingTop: 14, borderTop: '1px solid var(--line)' }}>
                <button type="button" className="btn ghost sm" onClick={() => setModalOpen(false)}>
                  Отмена
                </button>
                <button type="submit" className="btn primary sm" disabled={busy}>
                  {busy ? 'Сохранение…' : editingUser ? '💾 Сохранить' : '+ Добавить'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
