'use client';
import { createContext, useContext, useEffect, useMemo, useState, ReactNode, useCallback } from 'react';

export interface CartItem {
  id: number;
  slug: string;
  name: string; // display name (current language chosen at add time is fine; use name_ru here)
  price: number | null;
  qty: number;
}

interface CartCtx {
  items: CartItem[];
  count: number;
  total: number;
  add: (item: Omit<CartItem, 'qty'>, qty?: number) => void;
  remove: (id: number) => void;
  setQty: (id: number, qty: number) => void;
  clear: () => void;
  toast: string | null;
  showToast: (msg: string) => void;
}

const Ctx = createContext<CartCtx>(null!);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem('kiprol-cart');
      if (raw) setItems(JSON.parse(raw));
    } catch {}
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    localStorage.setItem('kiprol-cart', JSON.stringify(items));
  }, [items, loaded]);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast(null), 2600);
  }, []);

  const api = useMemo<CartCtx>(() => {
    const add: CartCtx['add'] = (item, qty = 1) => {
      setItems((prev) => {
        const ex = prev.find((i) => i.id === item.id);
        if (ex) return prev.map((i) => (i.id === item.id ? { ...i, qty: i.qty + qty } : i));
        return [...prev, { ...item, qty }];
      });
    };
    return {
      items,
      count: items.reduce((s, i) => s + i.qty, 0),
      total: items.reduce((s, i) => s + (i.price ?? 0) * i.qty, 0),
      add,
      remove: (id) => setItems((p) => p.filter((i) => i.id !== id)),
      setQty: (id, qty) =>
        setItems((p) => (qty <= 0 ? p.filter((i) => i.id !== id) : p.map((i) => (i.id === id ? { ...i, qty } : i)))),
      clear: () => setItems([]),
      toast,
      showToast,
    };
  }, [items, toast, showToast]);

  return (
    <Ctx.Provider value={api}>
      {children}
      {toast && <div className="toast show">{toast}</div>}
    </Ctx.Provider>
  );
}

export function useCart() {
  return useContext(Ctx);
}
