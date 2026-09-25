import { getPageSections } from '@/lib/content';
import { SectionRenderer } from '@/components/SectionRenderer';

export const dynamic = 'force-dynamic';

export default async function CheckoutPage() {
  const sections = await getPageSections('checkout');
  return <SectionRenderer sections={sections} />;
}
