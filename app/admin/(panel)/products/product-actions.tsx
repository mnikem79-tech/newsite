'use client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function ProductActions({ id, name }: { id: number; name: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const del = async () => {
    if (!confirm(`Удалить «${name}»?`)) return;
    setBusy(true);
    const res = await fetch(`/api/products/${id}`, { method: 'DELETE' });
    if (res.ok) router.refresh();
    else setBusy(false);
  };
  return (
    <button className="mini-btn red" onClick={del} disabled={busy}>
      {busy ? '…' : 'Удалить'}
    </button>
  );
}
