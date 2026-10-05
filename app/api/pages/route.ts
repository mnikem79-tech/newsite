import { NextResponse } from 'next/server';
import { q, invalidatePages } from '@/lib/db';
import { parseSessionToken, SESSION_COOKIE } from '@/lib/auth';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

async function adminId(): Promise<number | null> {
  const c = await cookies();
  return parseSessionToken(c.get(SESSION_COOKIE)?.value);
}

function slugify(s: string): string {
  const map = {
    а: 'a', б: 'b', в: 'v', г: 'g', д: 'd', е: 'e', ё: 'e', ж: 'zh', з: 'z', и: 'i', й: 'y',
    к: 'k', л: 'l', м: 'm', н: 'n', о: 'o', п: 'p', р: 'r', с: 's', т: 't', у: 'u', ф: 'f',
    х: 'h', ц: 'c', ч: 'ch', ш: 'sh', щ: 'sch', ъ: '', ы: 'y', ь: '', э: 'e', ю: 'yu', я: 'ya',
  };
  return String(s)
    .toLowerCase()
    .replace(/[а-яё]/g, (ch) => map[ch as keyof typeof map] ?? '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);
}

// GET /api/pages — public
export async function GET() {
  try {
    const r = await q(
      'SELECT id, slug, title_ru, is_active, in_menu, position, is_system FROM pages ORDER BY position, id'
    );
    return NextResponse.json(r.rows);
  } catch {
    return NextResponse.json([]);
  }
}

// POST /api/pages — admin: create
export async function POST(req: Request) {
  const uid = await adminId();
  if (!uid) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  let b: any;
  try {
    b = await req.json();
  } catch {
    return NextResponse.json({ error: 'invalid json' }, { status: 400 });
  }
  const title = String(b?.title_ru ?? '').trim();
  if (!title) return NextResponse.json({ error: 'title required' }, { status: 400 });

  let slug = slugify(b?.slug ? String(b.slug) : title);
  if (!slug) slug = 'page';
  // ensure unique
  const dup = await q('SELECT id FROM pages WHERE slug = $1', [slug]);
  if (dup.rows.length) {
    let n = 2;
    // eslint-disable-next-line no-await-in-loop
    while ((await q('SELECT id FROM pages WHERE slug = $1', [`${slug}-${n}`])).rows.length) n += 1;
    slug = `${slug}-${n}`;
  }

  const r = await q(
    `INSERT INTO pages (slug, title_ru, is_active, in_menu, position, is_system)
     VALUES ($1,$2,$3,$4,(SELECT COALESCE(MAX(position),0)+1 FROM pages),FALSE)
     RETURNING id, slug`,
    [slug, title, b?.is_active !== false, b?.in_menu !== false]
  );
  invalidatePages();
  return NextResponse.json(r.rows[0], { status: 201 });
}
