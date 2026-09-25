import { getMaterials, getPageSections } from '@/lib/content';
import { SectionRenderer } from '@/components/SectionRenderer';

export const dynamic = 'force-dynamic';

export default async function MaterialsPage() {
  const [materials, sections] = await Promise.all([
    getMaterials(),
    getPageSections('materials'),
  ]);

  return <SectionRenderer sections={sections} materials={materials} />;
}
