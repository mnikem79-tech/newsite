'use client';
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

type Lang = 'ru' | 'en';
const Ctx = createContext<{ lang: Lang; setLang: (l: Lang) => void }>({ lang: 'ru', setLang: () => {} });

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>('ru');
  useEffect(() => {
    const saved = (localStorage.getItem('kiprol-lang') as Lang) || 'ru';
    setLangState(saved);
  }, []);
  const setLang = (l: Lang) => {
    setLangState(l);
    localStorage.setItem('kiprol-lang', l);
  };
  return <Ctx.Provider value={{ lang, setLang }}>{children}</Ctx.Provider>;
}

export function useLang() {
  return useContext(Ctx);
}

/** Бilingual text: renders RU or EN depending on current language. */
export function L({ ru, en }: { ru: string; en?: string }) {
  const { lang } = useLang();
  return <>{lang === 'ru' ? ru : en ?? ru}</>;
}
