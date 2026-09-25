# Новый сайт (newsite)

Демо-сайт на готовом движке: Next.js 15 (App Router) + PostgreSQL.

Прод на домашнем сервере: каталог `/opt/newsite/app`, systemd-юнит `newsite.service`
(`npm start`, `0.0.0.0:3002`), переменные окружения — из `/opt/newsite/app/.env.production`.

Публичный доступ: `https://newsite.nail-app.ru` → VPS Caddy `147.45.211.79`
→ дом `195.46.191.98:8443` (контейнер `edge`) → `127.0.0.1:3002`.

## Обновление после правок (на домашнем сервере)

```bash
cd /opt/newsite/app
git pull origin main
npm install
npm run build
sudo systemctl restart newsite.service
```

## Очистка контента и повторное заполнение демо

```bash
cd /opt/newsite/app
sudo -u postgres psql newsite_db -c "TRUNCATE products, order_items, orders, categories, page_content, uploads RESTART IDENTITY CASCADE;"
node scripts/init-db.js
```

Пользователь `users` (админ) при этом сохраняется.

Секретов в репозитории нет: доступы к БД, ключ сессии и пароль админки лежат только
на сервере в `.env.production`.
