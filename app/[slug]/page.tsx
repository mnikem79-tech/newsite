import { notFound } from 'next/navigation';
import { getContacts, getMaterials, getPageSections, getServices, getPages } from '@/lib/content';
import { SectionRenderer } from '@/components/SectionRenderer';
import type { PageItem } from '@/lib/types';

export const dynamic = 'force-dynamic';

/** Страницы, у которых своя особая логика и которые живут отдельными маршрутами. */
const SPECIAL = new Set(['home', 'catalog', 'cart', 'checkout', 'admin']);

export async function generateStaticParams() {
  return [];
}

export default async function DynamicPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (SPECIAL.has(slug)) notFound();

  let page: PageItem | null = null;
  try {
    const all = await getPages();
    page = all.find((p) => p.slug === slug && p.is_active) ?? null;
  } catch (e) {
    console.error(e);
  }
  if (!page) notFound();

  const [sections, services, materials, contacts] = await Promise.all([
    getPageSections(slug),
    getServices(),
    getMaterials(),
    getContacts(),
  ]);

  return (
    <SectionRenderer
      sections={sections}
      services={services}
      materials={materials}
      contacts={contacts}
    />
  );
}
