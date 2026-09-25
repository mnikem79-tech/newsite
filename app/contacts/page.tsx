import { getContacts, getPageSections } from '@/lib/content';
import { SectionRenderer } from '@/components/SectionRenderer';

export const dynamic = 'force-dynamic';

export default async function ContactsPage() {
  const [c, sections] = await Promise.all([
    getContacts(),
    getPageSections('contacts'),
  ]);

  return <SectionRenderer sections={sections} contacts={c} />;
}
