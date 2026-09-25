'use client';

interface Props {
  html: string;
}

export function HtmlBlock({ html }: Props) {
  return (
    <div
      className="builder-content"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
