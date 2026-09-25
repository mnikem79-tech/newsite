import { getPageSections } from '@/lib/content';
import { SectionRenderer } from '@/components/SectionRenderer';

export const dynamic = 'force-dynamic';

export default async function AboutPage() {
  const sections = await getPageSections('about');
  return <SectionRenderer sections={sections} />;
}
