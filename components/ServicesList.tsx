import type { ServiceItem } from '@/lib/types';

export default function ServicesList({ services }: { services: ServiceItem[] }) {
  return (
    <div className="grid g2">
      {services.map((s) => (
        <div className="svc rv" key={s.num} style={s.num === '4.7' ? { gridColumn: '1/-1' } : undefined}>
          <div className="hd">
            <h3>{s.title_ru}</h3>
          </div>
          <div className="bd">
            {s.num === '4.7' ? (
              <div className="grid g3" style={{ marginTop: 6 }}>
                {s.list_ru.map((li, i) => (
                  <div key={i}>{li}</div>
                ))}
              </div>
            ) : s.list_ru.length ? (
              <>
                {s.body_ru && <p>{s.body_ru}</p>}
                <ul>
                  {s.list_ru.map((li, i) => (
                    <li key={i}>{li}</li>
                  ))}
                </ul>
              </>
            ) : (
              <p>{s.body_ru}</p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
