import { getPageSections } from '@/lib/content';
import { SectionRenderer } from '@/components/SectionRenderer';

export const dynamic = 'force-dynamic';

export default async function ProductionPage() {
  const sections = await getPageSections('production');
  return <SectionRenderer sections={sections} />;
}
