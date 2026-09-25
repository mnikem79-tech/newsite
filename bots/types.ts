export interface OrderNotificationItem {
  product_id?: number | null;
  product_name: string;
  quantity: number;
  price?: number | null;
  options?: string | null;
}

export interface OrderNotificationData {
  id?: number;
  number: string;
  name: string;
  phone: string;
  email?: string | null;
  company?: string | null;
  address?: string | null;
  comment?: string | null;
  payment?: string | null;
  total?: number | null;
  items?: OrderNotificationItem[];
  created_at?: string;
}

export interface BotRecipient {
  id: string; // Chat ID for Telegram or User/Peer ID for VK
  name: string; // Employee name or role, e.g. "Иван (директор)"
  enabled: boolean;
}

export interface EmailRecipient {
  email: string;
  name: string;
  enabled: boolean;
}

export interface BotNotificationsConfig {
  telegram_enabled: boolean;
  telegram_bot_token: string;
  telegram_api_url: string;
  telegram_recipients: BotRecipient[];

  vk_enabled: boolean;
  vk_bot_token: string;
  vk_recipients: BotRecipient[];

  mail_enabled: boolean;
  mail_host: string;
  mail_port: number;
  mail_secure: boolean;
  mail_user: string;
  mail_pass: string;
  mail_from: string;
  mail_recipients: EmailRecipient[];
}
