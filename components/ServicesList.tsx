'use client';
import { useLang } from './L';
import type { ServiceItem } from '@/lib/types';

export default function ServicesList({ services }: { services: ServiceItem[] }) {
  const { lang } = useLang();
  return (
    <div className="grid g2">
      {services.map((s) => (
        <div className="svc rv" key={s.num} style={s.num === '4.7' ? { gridColumn: '1/-1' } : undefined}>
          <div className="hd">
            <h3>{lang === 'ru' ? s.title_ru : s.title_en}</h3>
          </div>
          <div className="bd">
            {s.num === '4.7' ? (
              <div className="grid g3" style={{ marginTop: 6 }}>
                {(lang === 'ru' ? s.list_ru : s.list_en).map((li, i) => (
                  <div key={i}>{li}</div>
                ))}
              </div>
            ) : s.list_ru.length || s.list_en.length ? (
              <>
                {(lang === 'ru' ? s.body_ru : s.body_en) && <p>{lang === 'ru' ? s.body_ru : s.body_en}</p>}
                <ul>
                  {(lang === 'ru' ? s.list_ru : s.list_en).map((li, i) => (
                    <li key={i}>{li}</li>
                  ))}
                </ul>
              </>
            ) : (
              <p>{lang === 'ru' ? s.body_ru : s.body_en}</p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
