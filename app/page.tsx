import { q } from '@/lib/db';
import { getHero, getPageSections } from '@/lib/content';
import { SectionRenderer } from '@/components/SectionRenderer';
import type { Category } from '@/lib/types';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const hero = await getHero();
  const sections = await getPageSections('home');

  let cats: Category[] = [];
  try {
    const r = await q('SELECT * FROM categories ORDER BY position LIMIT 6');
    cats = r.rows;
  } catch (e) {
    console.error(e);
  }

  return (
    <SectionRenderer
      sections={sections}
      hero={hero}
      categories={cats}
    />
  );
}
