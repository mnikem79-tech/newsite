import { NextResponse } from 'next/server';
import { q, invalidateContent } from '@/lib/db';
import { parseSessionToken, SESSION_COOKIE } from '@/lib/auth';
import { cookies } from 'next/headers';
import seed from '@/lib/seed-data';
import { getDefaultSections } from '@/lib/default-sections';

export const dynamic = 'force-dynamic';

const ALLOWED = [
  'home_hero',
  'about_intro',
  'contacts',
  'site',
  'materials',
  'services',
  'notifications',
  'sections_home',
  'sections_about',
  'sections_catalog',
  'sections_production',
  'sections_services',
  'sections_contacts',
  'sections_materials',
  'sections_cart',
  'sections_checkout',
];

function isKeyAllowed(key: string): boolean {
  return ALLOWED.includes(key) || key.startsWith('sections_');
}

async function adminId(): Promise<number | null> {
  const c = await cookies();
  return parseSessionToken(c.get(SESSION_COOKIE)?.value);
}

// GET /api/content/:key — public
export async function GET(_req: Request, { params }: { params: Promise<{ key: string }> }) {
  const { key } = await params;
  if (!isKeyAllowed(key)) return NextResponse.json({ error: 'unknown key' }, { status: 400 });
  try {
    const r = await q('SELECT data FROM page_content WHERE key = $1', [key]);
    if (!r.rows.length) {
      if (key === 'notifications') {
        return NextResponse.json(null);
      }
      if (key.startsWith('sections_')) {
        return NextResponse.json(getDefaultSections(key.replace('sections_', '')));
      }
      return NextResponse.json(seed.contentDefaults[key as keyof typeof seed.contentDefaults] ?? null);
    }
    return NextResponse.json(r.rows[0].data);
  } catch (err) {
    if (key.startsWith('sections_')) {
      return NextResponse.json(getDefaultSections(key.replace('sections_', '')));
    }
    return NextResponse.json({ error: 'db error' }, { status: 500 });
  }
}

// PUT /api/content/:key — admin
export async function PUT(req: Request, { params }: { params: Promise<{ key: string }> }) {
  const { key } = await params;
  const uid = await adminId();
  if (!uid) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  if (!isKeyAllowed(key)) return NextResponse.json({ error: 'unknown key' }, { status: 400 });
  let data: unknown;
  try {
    data = await req.json();
  } catch {
    return NextResponse.json({ error: 'invalid json' }, { status: 400 });
  }
  await q(
    `INSERT INTO page_content (key, data) VALUES ($1,$2)
     ON CONFLICT (key) DO UPDATE SET data = EXCLUDED.data, updated_at = now()`,
    [key, JSON.stringify(data)]
  );
  invalidateContent(key);
  return NextResponse.json({ ok: true });
}
