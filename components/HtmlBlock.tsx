'use client';
import { useLang } from '@/components/L';

interface Props {
  htmlRu: string;
  htmlEn?: string;
}

export function HtmlBlock({ htmlRu, htmlEn }: Props) {
  const { lang } = useLang();
  const html = lang === 'en' && htmlEn && htmlEn.trim() ? htmlEn : htmlRu;

  return (
    <div
      className="builder-content"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
