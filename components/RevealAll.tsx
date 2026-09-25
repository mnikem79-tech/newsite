'use client';
import { useEffect } from 'react';

/** Applies the original one-pager's scroll-reveal behavior to all .rv elements,
    including ones that appear after client-side navigation. */
export default function RevealAll() {
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            (e.target as HTMLElement).classList.add('in');
            io.unobserve(e.target);
          }
        }
      },
      { threshold: 0.08 }
    );
    const scan = () => document.querySelectorAll<HTMLElement>('.rv:not(.in)').forEach((el) => io.observe(el));
    scan();
    const mo = new MutationObserver(scan);
    mo.observe(document.body, { childList: true, subtree: true });
    return () => {
      io.disconnect();
      mo.disconnect();
    };
  }, []);
  return null;
}
