import { q } from '@/lib/db';
import NotificationsClient from './notifications-client';
import type { BotNotificationsConfig, BotRecipient, EmailRecipient } from '@/bots/types';

export const dynamic = 'force-dynamic';

async function getKey(key: string): Promise<unknown> {
  try {
    const r = await q('SELECT data FROM page_content WHERE key = $1', [key]);
    return r.rows.length ? r.rows[0].data : null;
  } catch {
    return null;
  }
}

export default async function AdminNotificationsPage() {
  const [notifRaw, siteRaw] = await Promise.all([
    getKey('notifications'),
    getKey('site'),
  ]);

  const notif = (notifRaw as Record<string, any>) || {};
  const site = (siteRaw as Record<string, any>) || {};

  // Build Telegram recipients list with fallbacks
  let telegram_recipients: BotRecipient[] = [];
  if (Array.isArray(notif.telegram_recipients) && notif.telegram_recipients.length > 0) {
    telegram_recipients = notif.telegram_recipients.map((r: any) => ({
      id: String(r.id || '').trim(),
      name: String(r.name || '').trim(),
      enabled: r.enabled !== false,
    }));
  } else if (site.telegram_chat_id || process.env.TELEGRAM_CHAT_ID) {
    const rawIds = String(site.telegram_chat_id || process.env.TELEGRAM_CHAT_ID || '545061255').split(/[,;\s]+/);
    telegram_recipients = rawIds.filter(Boolean).map((id: string, idx: number) => ({
      id: id.trim(),
      name: idx === 0 ? 'Основной' : `Сотрудник ${idx + 1}`,
      enabled: true,
    }));
  } else {
    telegram_recipients = [{ id: '545061255', name: 'Основной', enabled: true }];
  }

  // Build VK recipients list with fallbacks
  let vk_recipients: BotRecipient[] = [];
  if (Array.isArray(notif.vk_recipients) && notif.vk_recipients.length > 0) {
    vk_recipients = notif.vk_recipients.map((r: any) => ({
      id: String(r.id || '').trim(),
      name: String(r.name || '').trim(),
      enabled: r.enabled !== false,
    }));
  } else if (site.vk_user_id || process.env.VK_USER_ID) {
    const rawIds = String(site.vk_user_id || process.env.VK_USER_ID || '6779859').split(/[,;\s]+/);
    vk_recipients = rawIds.filter(Boolean).map((id: string, idx: number) => ({
      id: id.trim(),
      name: idx === 0 ? 'Основной' : `Сотрудник ${idx + 1}`,
      enabled: true,
    }));
  } else {
    vk_recipients = [{ id: '6779859', name: 'Основной', enabled: true }];
  }

  // Build Corporate Mail recipients list with fallbacks
  let mail_recipients: EmailRecipient[] = [];
  if (Array.isArray(notif.mail_recipients) && notif.mail_recipients.length > 0) {
    mail_recipients = notif.mail_recipients.map((r: any) => ({
      email: String(r.email || '').trim(),
      name: String(r.name || '').trim(),
      enabled: r.enabled !== false,
    }));
  } else if (Array.isArray(notif.email_recipients) && notif.email_recipients.length > 0) {
    mail_recipients = notif.email_recipients.map((r: any) => ({
      email: String(r.email || '').trim(),
      name: String(r.name || '').trim(),
      enabled: r.enabled !== false,
    }));
  } else {
    mail_recipients = [{ email: 'nikem79@yandex.ru', name: 'Николай', enabled: true }];
  }

  const initialConfig: BotNotificationsConfig = {
    telegram_enabled: notif.telegram_enabled ?? true,
    telegram_bot_token: notif.telegram_bot_token || site.telegram_bot_token || '',
    telegram_api_url: notif.telegram_api_url || 'https://api.telegram.org',
    telegram_recipients,

    vk_enabled: notif.vk_enabled ?? true,
    vk_bot_token: notif.vk_bot_token || site.vk_bot_token || '',
    vk_recipients,

    mail_enabled: notif.mail_enabled ?? notif.email_enabled ?? true,
    mail_host: notif.mail_host || process.env.MAIL_HOST || 'mail.kiprol.ru',
    mail_port: Number(notif.mail_port || process.env.MAIL_PORT) || 465,
    mail_secure: notif.mail_secure !== undefined ? notif.mail_secure : true,
    mail_user: notif.mail_user || process.env.MAIL_USER || 'zakaz@kiprol.ru',
    mail_pass: notif.mail_pass || process.env.MAIL_PASS || '',
    mail_from: notif.mail_from || process.env.MAIL_FROM || 'НПО КИПРОЛ <zakaz@kiprol.ru>',
    mail_recipients,
  };

  return <NotificationsClient initial={initialConfig} />;
}
