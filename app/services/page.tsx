import { getServices, getPageSections } from '@/lib/content';
import { SectionRenderer } from '@/components/SectionRenderer';

export const dynamic = 'force-dynamic';

export default async function ServicesPage() {
  const [services, sections] = await Promise.all([
    getServices(),
    getPageSections('services'),
  ]);

  return <SectionRenderer sections={sections} services={services} />;
}
