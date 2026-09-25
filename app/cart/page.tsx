import { getPageSections } from '@/lib/content';
import { SectionRenderer } from '@/components/SectionRenderer';

export const dynamic = 'force-dynamic';

export default async function CartPage() {
  const sections = await getPageSections('cart');
  return <SectionRenderer sections={sections} />;
}
