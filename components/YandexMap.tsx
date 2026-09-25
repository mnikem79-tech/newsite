'use client';
import { useEffect, useRef, useState } from 'react';
import { useLang } from './L';

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ymaps?: any;
  }
}

type Props = {
  center: [number, number];
  zoom?: number;
  titleRu: string;
  titleEn: string;
  addressRu: string;
  addressEn: string;
};

export default function YandexMap({ center, zoom = 12, titleRu, titleEn, addressRu, addressEn }: Props) {
  const { lang } = useLang();
  const divRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mapRef = useRef<any>(null);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const key = process.env.NEXT_PUBLIC_YANDEX_MAPS_API_KEY;

  useEffect(() => {
    if (!key) {
      setFailed(true);
      return;
    }
    let disposed = false;

    const loadApi = () =>
      new Promise<void>((resolve, reject) => {
        if (window.ymaps) return resolve();
        const s = document.createElement('script');
        s.src = `https://api-maps.yandex.ru/2.1/?apikey=${encodeURIComponent(key)}&lang=ru_RU`;
        s.async = true;
        s.onload = () => window.ymaps.ready(() => resolve());
        s.onerror = () => reject(new Error('ymaps: script load error'));
        document.head.appendChild(s);
      });

    loadApi()
      .then(() => {
        if (disposed || !divRef.current || !window.ymaps) return;
        if (!mapRef.current) {
          mapRef.current = new window.ymaps.Map(divRef.current, {
            center,
            zoom,
            controls: ['zoomControl'],
          });
          mapRef.current.geoObjects.add(
            new window.ymaps.Placemark(
              center,
              {
                balloonContent: `<b>${titleRu}</b><br>${addressRu}`,
                hintContent: titleRu,
              },
              { iconColor: '#25c3d6' },
            ),
          );
        }
        setReady(true);
      })
      .catch(() => {
        if (!disposed) setFailed(true);
      });

    return () => {
      disposed = true;
      try {
        mapRef.current?.destroy();
      } catch {
        /* noop */
      }
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  if (failed) {
    return (
      <div className="map-fallback">
        <span style={{ fontSize: 30 }}>📍</span>
        <div>
          <b>{lang === 'ru' ? titleRu : titleEn}</b>
          <br />
          {lang === 'ru' ? addressRu : addressEn}
        </div>
        <a
          href={`https://yandex.ru/maps/?text=${encodeURIComponent((lang === 'ru' ? addressRu : addressEn) + ' ' + titleRu)}`}
          target="_blank"
          rel="noreferrer"
        >
          {lang === 'ru' ? 'Открыть в Яндекс Картах' : 'Open in Yandex Maps'} ↗
        </a>
      </div>
    );
  }

  return (
    <>
      <div ref={divRef} className="ymap" />
      {!ready && <div className="ymap-load">{lang === 'ru' ? 'Загрузка карты…' : 'Loading map…'}</div>}
    </>
  );
}
