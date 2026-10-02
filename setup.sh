#!/usr/bin/env bash
# ==============================================================================
# Автоматический скрипт развёртывания нового сайта на сервере
# ==============================================================================
set -e

echo "=== Инициализация нового сайта ==="

# 1. Запрос параметров (или значения по умолчанию)
read -p "Введите имя проекта (латиницей, например mysite): " PROJECT_NAME
PROJECT_NAME=${PROJECT_NAME:-mysite}

read -p "Введите порт для запуска (по умолчанию 3002): " APP_PORT
APP_PORT=${APP_PORT:-3002}

read -p "Введите имя новой базы данных (по умолчанию ${PROJECT_NAME}_db): " DB_NAME
DB_NAME=${DB_NAME:-${PROJECT_NAME}_db}

read -p "Введите пароль пользователя БД postgres: " DB_PASS
DB_PASS=${DB_PASS:-postgres}

read -p "Введите email администратора для входа в админку (по умолчанию admin@${PROJECT_NAME}.ru): " ADMIN_EMAIL
ADMIN_EMAIL=${ADMIN_EMAIL:-admin@${PROJECT_NAME}.ru}

read -p "Введите пароль администратора админки: " ADMIN_PASS
if [ -z "$ADMIN_PASS" ]; then
  ADMIN_PASS=$(openssl rand -base64 12)
  echo "Сгенерирован пароль администратора: $ADMIN_PASS"
fi

SESSION_SECRET=$(openssl rand -hex 32)
CURRENT_DIR=$(pwd)

# 2. Создание базы данных PostgreSQL
echo "Создание базы данных $DB_NAME..."
sudo -u postgres psql -tc "SELECT 1 FROM pg_database WHERE datname = '$DB_NAME'" | grep -q 1 || sudo -u postgres createdb "$DB_NAME"

# 3. Формирование .env.production
echo "Создание файла конфигурации .env.production..."
cat <<EOF > .env.production
DATABASE_URL=postgresql://postgres:${DB_PASS}@localhost:5432/${DB_NAME}
PORT=${APP_PORT}
HOST=0.0.0.0
ADMIN_EMAIL=${ADMIN_EMAIL}
ADMIN_PASSWORD=${ADMIN_PASS}
SESSION_SECRET=${SESSION_SECRET}
EOF

chmod 600 .env.production

# 4. Установка зависимостей и сборка Next.js
echo "Установка библиотек и сборка проекта..."
npm install
npm run build

# 5. Инициализация таблиц базы данных
echo "Инициализация таблиц и создание пользователя админки..."
node scripts/init-db.js

# 6. Создание системной службы systemd
SERVICE_FILE="/etc/systemd/system/${PROJECT_NAME}.service"
echo "Создание системной службы $SERVICE_FILE..."
sudo bash -c "cat <<EOF > $SERVICE_FILE
[Unit]
Description=${PROJECT_NAME} Website (Next.js)
After=network.target postgresql.service

[Service]
Type=simple
User=$(whoami)
WorkingDirectory=${CURRENT_DIR}
EnvironmentFile=${CURRENT_DIR}/.env.production
ExecStart=$(which npm) start
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
EOF"

sudo systemctl daemon-reload
sudo systemctl enable --now "${PROJECT_NAME}.service"

echo ""
echo "=================================================================="
echo "✅ Сайт успешно установлен и запущен на порту ${APP_PORT}!"
echo "Вход в админку: http://IP_СЕРВЕРА:${APP_PORT}/admin"
echo "Логин: ${ADMIN_EMAIL}"
echo "Пароль: ${ADMIN_PASS}"
echo "Служба: ${PROJECT_NAME}.service (управление: sudo systemctl restart ${PROJECT_NAME})"
echo "=================================================================="
