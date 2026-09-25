import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { parseSessionToken, SESSION_COOKIE } from '@/lib/auth';
import AdminShell from '@/components/AdminShell';

export const dynamic = 'force-dynamic';

export default async function AdminPanelLayout({ children }: { children: React.ReactNode }) {
  const c = await cookies();
  const uid = parseSessionToken(c.get(SESSION_COOKIE)?.value);
  if (!uid) redirect('/admin/login');
  return <AdminShell>{children}</AdminShell>;
}
