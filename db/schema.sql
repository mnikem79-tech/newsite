-- НПО КИПРОЛ — site schema (PostgreSQL 17)

CREATE TABLE IF NOT EXISTS users (
  id            SERIAL PRIMARY KEY,
  email         TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  display_name  TEXT,
  role          TEXT NOT NULL DEFAULT 'admin',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS categories (
  id         SERIAL PRIMARY KEY,
  slug       TEXT NOT NULL UNIQUE,
  code       TEXT NOT NULL,
  name_ru    TEXT NOT NULL,
  note_ru    TEXT,
  icon       TEXT NOT NULL DEFAULT '⚡',
  position   INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS products (
  id              SERIAL PRIMARY KEY,
  slug            TEXT NOT NULL UNIQUE,
  category_id     INTEGER NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  code            TEXT NOT NULL,
  name_ru         TEXT NOT NULL,
  description_ru  TEXT NOT NULL DEFAULT '',
  price           NUMERIC(12,2),
  price_note      TEXT,
  is_active       BOOLEAN NOT NULL DEFAULT TRUE,
  icon            TEXT NOT NULL DEFAULT '⚡',
  position        INTEGER NOT NULL DEFAULT 0,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);

CREATE TABLE IF NOT EXISTS orders (
  id         SERIAL PRIMARY KEY,
  number     TEXT NOT NULL UNIQUE,
  name       TEXT NOT NULL,
  phone      TEXT NOT NULL,
  email      TEXT,
  company    TEXT,
  address    TEXT,
  comment    TEXT,
  payment    TEXT,
  status     TEXT NOT NULL DEFAULT 'new',
  total      NUMERIC(12,2),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);

CREATE TABLE IF NOT EXISTS order_items (
  id           SERIAL PRIMARY KEY,
  order_id     INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id   INTEGER REFERENCES products(id) ON DELETE SET NULL,
  product_name TEXT NOT NULL,
  quantity     INTEGER NOT NULL DEFAULT 1,
  price        NUMERIC(12,2),
  options      TEXT
);
CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);

CREATE TABLE IF NOT EXISTS page_content (
  key        TEXT PRIMARY KEY,
  data       JSONB NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS uploads (
  id            SERIAL PRIMARY KEY,
  filename      TEXT NOT NULL UNIQUE,
  original_name TEXT NOT NULL,
  mime_type     TEXT NOT NULL,
  size_bytes    INTEGER NOT NULL,
  data          BYTEA NOT NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_uploads_filename ON uploads(filename);
