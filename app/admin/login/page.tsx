import Link from 'next/link';
import AdminLoginForm from './login-form';

export const dynamic = 'force-dynamic';

export default function AdminLoginPage() {
  return (
    <div className="login-wrap">
      <div className="login-card">
        <div className="llogo">К</div>
        <h1>Админ-панель</h1>
        <div className="ls">НПО КИПРОЛ · вход для сотрудников</div>
        <AdminLoginForm />
        <p style={{ marginTop: 20, fontSize: 13, color: 'var(--muted2)' }}>
          <Link href="/" style={{ color: 'var(--muted)' }}>← На главную страницу</Link>
        </p>
      </div>
    </div>
  );
}
