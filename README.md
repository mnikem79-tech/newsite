# Сайт kiprol.ru (НПО КИПРОЛ)

Next.js (App Router), PostgreSQL. Снимок рабочей версии с сервера от 17.09.2026.

Прод на сервере: каталог `/opt/kiprol/app`, systemd-юнит `kiprol.service` (npm start, 127.0.0.1:3000),
переменные окружения — из `/opt/kiprol/app/.env.production`.

## Локальный запуск
```bash
npm ci
cp .env.example .env.local     # заполнить своими значениями
npm run dev
```

## Сборка
```bash
npm run build && npm start
```

Секретов в репозитории нет: значения доступов к БД, ключ сессии и пароль админки лежат только
на сервере в `.env.production`. В репозитории — только список имён переменных (.env.example).
