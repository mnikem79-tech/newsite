export interface Category {
  id: number;
  slug: string;
  code: string;
  name_ru: string;
  name_en: string;
  note_ru: string | null;
  note_en: string | null;
  icon: string;
  position: number;
}

export interface Product {
  id: number;
  slug: string;
  category_id: number;
  code: string;
  name_ru: string;
  name_en: string;
  description_ru: string;
  description_en: string;
  price: number | null;
  price_note: string | null;
  is_active: boolean;
  icon: string;
  position: number;
  category?: Category;
}

export type OrderStatus = 'new' | 'processing' | 'shipped' | 'done' | 'canceled';

export interface OrderItem {
  id: number;
  order_id: number;
  product_id: number | null;
  product_name: string;
  quantity: number;
  price: number | null;
  options: string | null;
}

export interface Order {
  id: number;
  number: string;
  name: string;
  phone: string;
  email: string | null;
  company: string | null;
  address: string | null;
  comment: string | null;
  payment: string | null;
  status: OrderStatus;
  total: number | null;
  created_at: string;
  updated_at: string;
  items?: OrderItem[];
}

export interface ContactInfo {
  phone: string;
  phone_href: string;
  email: string;
  address_ru: string;
  address_en: string;
  hours_ru: string;
  hours_en: string;
  telegram_url: string;
}

export interface MaterialItem {
  code: string;
  title_ru: string;
  title_en: string;
  std: string;
}

export interface ServiceItem {
  num: string;
  title_ru: string;
  title_en: string;
  body_ru: string;
  body_en: string;
  list_ru: string[];
  list_en: string[];
}

export interface HomeHero {
  kicker_ru: string;
  kicker_en: string;
  title_ru: string;
  title_en: string;
  subtitle_ru: string;
  subtitle_en: string;
}

export interface AboutIntro {
  badge_ru: string;
  badge_en: string;
  title_ru: string;
  title_en: string;
  intro_ru: string;
  intro_en: string;
}

export interface SiteSettings {
  topbar_ru: string;
  topbar_en: string;
  footer_ru: string;
  footer_en: string;
  telegram_url: string;
  [key: string]: string | undefined;
}

/* ============================================================
   PAGE BUILDER & MEDIA TYPES
   ============================================================ */

export type SectionType =
  | 'html'
  | 'hero'
  | 'catalog_grid'
  | 'catalog_view'
  | 'cart_view'
  | 'checkout_view'
  | 'services_list'
  | 'materials_list'
  | 'contacts_main'
  | 'publications'
  | 'patents';

export interface PageSection {
  id: string;
  name: string;
  type: SectionType;
  is_active: boolean;
  container?: 'wrap' | 'full' | 'narrow';
  bg?: 'default' | 'panel' | 'dark' | 'transparent';
  html_ru: string;
  html_en?: string;
  padding_top?: number;
  padding_bottom?: number;
  title_ru?: string;
  title_en?: string;
  subtitle_ru?: string;
  subtitle_en?: string;
}

export interface UploadedFile {
  id: number;
  filename: string;
  original_name: string;
  mime_type: string;
  size_bytes: number;
  url: string;
  created_at: string;
}
