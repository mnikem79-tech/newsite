import { getContentCached } from '@/lib/db';
import type { OrderNotificationData, BotRecipient } from './types';

function formatPrice(n: number): string {
  return new Intl.NumberFormat('ru-RU').format(n);
}

export interface VkConfig {
  enabled: boolean;
  token: string;
  recipients: BotRecipient[];
}

export async function getVkConfig(): Promise<VkConfig> {
  let token = (process.env.VK_BOT_TOKEN || '').trim();
  let enabled = true;
  let recipients: BotRecipient[] = [];

  // 1. Check 'notifications' content in DB
  try {
    const notif = (await getContentCached('notifications')) as Record<string, any> | null;
    if (notif) {
      if (typeof notif.vk_enabled === 'boolean') enabled = notif.vk_enabled;
      if (notif.vk_bot_token) token = String(notif.vk_bot_token).trim();
      if (Array.isArray(notif.vk_recipients)) {
        recipients = notif.vk_recipients
          .filter((r: any) => r && typeof r.id === 'string' && r.id.trim())
          .map((r: any) => ({
            id: String(r.id).trim(),
            name: typeof r.name === 'string' ? r.name.trim() : '',
            enabled: r.enabled !== false,
          }));
      }
    }
  } catch {
    // ignore
  }

  // 2. Fallback to 'site' content in DB
  if (!token || recipients.length === 0) {
    try {
      const site = (await getContentCached('site')) as Record<string, any> | null;
      if (site) {
        if (!token && site.vk_bot_token) token = String(site.vk_bot_token).trim();
        if (recipients.length === 0 && site.vk_user_id) {
          const ids = String(site.vk_user_id).split(/[,;\s]+/);
          for (const raw of ids) {
            const clean = raw.trim();
            if (clean) recipients.push({ id: clean, name: 'Основной', enabled: true });
          }
        }
      }
    } catch {
      // ignore
    }
  }

  // 3. Fallback to process.env
  if (recipients.length === 0) {
    const envPeer = (
      process.env.VK_USER_ID ||
      process.env.VK_PEER_ID ||
      process.env.VK_CHAT_ID ||
      ''
    ).trim();
    if (envPeer) {
      const ids = envPeer.split(/[,;\s]+/);
      for (const raw of ids) {
        const clean = raw.trim();
        if (clean) recipients.push({ id: clean, name: 'Основной', enabled: true });
      }
    }
  }

  return { enabled, token, recipients };
}

export function formatVkMessage(data: OrderNotificationData): string {
  const isOrder = Array.isArray(data.items) && data.items.length > 0;
  const title = isOrder ? '🛒 Новый заказ с сайта kiprol.ru' : '🔔 Новая заявка с сайта kiprol.ru';

  const lines: string[] = [
    title,
    `📋 Номер: ${data.number}`,
    `👤 Имя: ${data.name}`,
    `📞 Телефон: ${data.phone}`,
  ];

  if (data.email) {
    lines.push(`✉️ Email: ${data.email}`);
  }
  if (data.company) {
    lines.push(`🏢 Компания: ${data.company}`);
  }
  if (data.address) {
    lines.push(`📍 Адрес: ${data.address}`);
  }
  if (data.payment) {
    lines.push(`💳 Оплата: ${data.payment}`);
  }
  if (data.comment) {
    lines.push(`💬 Сообщение:\n${data.comment}`);
  }

  if (isOrder && data.items) {
    lines.push('');
    lines.push('📦 Содержимое заказа:');
    data.items.forEach((it, idx) => {
      const priceStr =
        it.price != null && it.price > 0
          ? ` — ${formatPrice(it.price * it.quantity)} ₽`
          : '';
      lines.push(`${idx + 1}. ${it.product_name} × ${it.quantity} шт.${priceStr}`);
    });

    if (data.total != null && data.total > 0) {
      lines.push(`\n💰 Итоговая сумма: ${formatPrice(data.total)} ₽`);
    }
  }

  if (data.id) {
    lines.push('');
    lines.push(`🔗 Админка: https://kiprol.ru/admin/orders/${data.id}`);
  }

  return lines.join('\n');
}

export async function sendVkMessage(
  message: string,
  peerId: string,
  tokenOverride?: string
): Promise<{ ok: boolean; error?: string }> {
  const config = await getVkConfig();
  const activeToken = (tokenOverride || config.token || '').trim();
  const activePeerId = peerId.trim();

  if (!activeToken) {
    return {
      ok: false,
      error: 'Ключ доступа VK не настроен в админке или в .env.production',
    };
  }
  if (!activePeerId) {
    return {
      ok: false,
      error: 'VK ID получателя не указан',
    };
  }

  try {
    const randomId = Math.floor(Math.random() * 2147483647);
    const params = new URLSearchParams({
      access_token: activeToken,
      v: '5.199',
      random_id: String(randomId),
      peer_id: activePeerId,
      message,
    });

    const res = await fetch('https://api.vk.com/method/messages.send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString(),
    });

    const data = (await res.json()) as {
      response?: number;
      error?: { error_code: number; error_msg: string };
    };

    if (data.error) {
      let desc = `Ошибка VK #${data.error.error_code}: ${data.error.error_msg}`;
      if (data.error.error_code === 901) {
        desc += ' (Пользователь ещё не написал первое сообщение в диалог с сообществом)';
      }
      return { ok: false, error: desc };
    }

    return { ok: true };
  } catch (err) {
    const errMsg = err instanceof Error ? err.message : String(err);
    return { ok: false, error: errMsg };
  }
}

export async function sendVkNotification(
  data: OrderNotificationData
): Promise<{ ok: boolean; sent: number; total: number; error?: string }> {
  const config = await getVkConfig();
  if (!config.enabled) {
    return { ok: true, sent: 0, total: 0 };
  }
  if (!config.token) {
    return { ok: false, sent: 0, total: 0, error: 'Ключ доступа VK не настроен' };
  }

  const activeRecipients = config.recipients.filter((r) => r.enabled !== false && r.id.trim());
  if (activeRecipients.length === 0) {
    return { ok: false, sent: 0, total: 0, error: 'Нет активных получателей VK' };
  }

  const message = formatVkMessage(data);
  let sent = 0;
  const errors: string[] = [];

  for (const r of activeRecipients) {
    const res = await sendVkMessage(message, r.id, config.token);
    if (res.ok) {
      sent++;
    } else {
      errors.push(`${r.name || r.id}: ${res.error}`);
    }
  }

  return {
    ok: sent > 0,
    sent,
    total: activeRecipients.length,
    error: errors.length ? errors.join('; ') : undefined,
  };
}

export async function testVk(
  peerId?: string,
  token?: string,
  recipientsList?: BotRecipient[]
): Promise<{ ok: boolean; error?: string; sent?: number; total?: number; details?: Record<string, { ok: boolean; error?: string }> }> {
  const text =
    '✅ Тестовое оповещение от группы ВКонтакте.\n\n' +
    'Связь между сайтом kiprol.ru и сообществом ВКонтакте успешно установлена! ' +
    'Новые заявки и заказы будут приходить сюда в реальном времени.';

  // If testing single recipient
  if (peerId) {
    const res = await sendVkMessage(text, peerId, token);
    return {
      ok: res.ok,
      error: res.error,
      sent: res.ok ? 1 : 0,
      total: 1,
      details: { [peerId]: res },
    };
  }

  // If testing multiple recipients
  const config = await getVkConfig();
  const activeToken = token || config.token;
  const list = recipientsList && recipientsList.length > 0
    ? recipientsList.filter((r) => r.enabled !== false && r.id.trim())
    : config.recipients.filter((r) => r.enabled !== false && r.id.trim());

  if (list.length === 0) {
    return { ok: false, error: 'Список получателей VK пуст' };
  }

  let sent = 0;
  const details: Record<string, { ok: boolean; error?: string }> = {};
  const errors: string[] = [];

  for (const r of list) {
    const res = await sendVkMessage(text, r.id, activeToken);
    details[r.id] = res;
    if (res.ok) {
      sent++;
    } else {
      errors.push(`${r.name || r.id}: ${res.error}`);
    }
  }

  return {
    ok: sent > 0,
    sent,
    total: list.length,
    error: errors.length ? errors.join('; ') : undefined,
    details,
  };
}
