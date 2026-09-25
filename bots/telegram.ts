import dns from 'node:dns';
import https from 'node:https';
import { getContentCached } from '@/lib/db';
import type { OrderNotificationData, BotRecipient } from './types';

// Force Node.js DNS to prefer IPv4 over IPv6
try {
  if (typeof dns?.setDefaultResultOrder === 'function') {
    dns.setDefaultResultOrder('ipv4first');
  }
} catch {
  // ignore
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function formatPrice(n: number): string {
  return new Intl.NumberFormat('ru-RU').format(n);
}

export interface TelegramConfig {
  enabled: boolean;
  token: string;
  apiUrl: string;
  recipients: BotRecipient[];
}

export async function getTelegramConfig(): Promise<TelegramConfig> {
  let token = (process.env.TELEGRAM_BOT_TOKEN || '').trim();
  let apiUrl = (process.env.TELEGRAM_API_URL || 'https://api.telegram.org').trim();
  let enabled = true;
  let recipients: BotRecipient[] = [];

  // 1. Try reading from 'notifications' in DB
  try {
    const notif = (await getContentCached('notifications')) as Record<string, any> | null;
    if (notif) {
      if (typeof notif.telegram_enabled === 'boolean') enabled = notif.telegram_enabled;
      if (notif.telegram_bot_token) token = String(notif.telegram_bot_token).trim();
      if (notif.telegram_api_url) apiUrl = String(notif.telegram_api_url).trim();
      if (Array.isArray(notif.telegram_recipients)) {
        recipients = notif.telegram_recipients
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

  // 2. Fallback to 'site' table in DB
  if (!token || recipients.length === 0) {
    try {
      const site = (await getContentCached('site')) as Record<string, any> | null;
      if (site) {
        if (!token && site.telegram_bot_token) token = String(site.telegram_bot_token).trim();
        if (recipients.length === 0 && site.telegram_chat_id) {
          const ids = String(site.telegram_chat_id).split(/[,;\s]+/);
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

  // 3. Fallback to env vars
  if (recipients.length === 0 && process.env.TELEGRAM_CHAT_ID) {
    const ids = String(process.env.TELEGRAM_CHAT_ID).split(/[,;\s]+/);
    for (const raw of ids) {
      const clean = raw.trim();
      if (clean) recipients.push({ id: clean, name: 'Основной', enabled: true });
    }
  }

  return { enabled, token, apiUrl, recipients };
}

export function formatTelegramMessage(data: OrderNotificationData): string {
  const isOrder = Array.isArray(data.items) && data.items.length > 0;
  const title = isOrder ? '🛒 <b>Новый заказ с сайта kiprol.ru</b>' : '🔔 <b>Новая заявка с сайта kiprol.ru</b>';

  const lines: string[] = [
    title,
    `📋 <b>Номер:</b> <code>${escapeHtml(data.number)}</code>`,
    `👤 <b>Имя:</b> ${escapeHtml(data.name)}`,
    `📞 <b>Телефон:</b> <code>${escapeHtml(data.phone)}</code>`,
  ];

  if (data.email) {
    lines.push(`✉️ <b>Email:</b> ${escapeHtml(data.email)}`);
  }
  if (data.company) {
    lines.push(`🏢 <b>Компания:</b> ${escapeHtml(data.company)}`);
  }
  if (data.address) {
    lines.push(`📍 <b>Адрес:</b> ${escapeHtml(data.address)}`);
  }
  if (data.payment) {
    lines.push(`💳 <b>Оплата:</b> ${escapeHtml(data.payment)}`);
  }
  if (data.comment) {
    lines.push(`💬 <b>Сообщение:</b>\n${escapeHtml(data.comment)}`);
  }

  if (isOrder && data.items) {
    lines.push('');
    lines.push('📦 <b>Содержимое заказа:</b>');
    data.items.forEach((it, idx) => {
      const priceStr =
        it.price != null && it.price > 0
          ? ` — ${formatPrice(it.price * it.quantity)} ₽`
          : '';
      lines.push(`${idx + 1}. ${escapeHtml(it.product_name)} × ${it.quantity} шт.${priceStr}`);
    });

    if (data.total != null && data.total > 0) {
      lines.push(`\n💰 <b>Итоговая сумма:</b> <b>${formatPrice(data.total)} ₽</b>`);
    }
  }

  if (data.id) {
    lines.push('');
    lines.push(`🔗 <a href="https://kiprol.ru/admin/orders/${data.id}">Открыть заказ в админке</a>`);
  }

  return lines.join('\n');
}

/**
 * Send request to Telegram Bot API with IPv4 socket fallback
 */
export async function postTelegramApi(
  token: string,
  method: string,
  payload: Record<string, unknown>,
  customApiUrl?: string
): Promise<{ ok: boolean; error?: string }> {
  const cleanToken = token.replace(/^bot/i, '').trim();
  const rawBase = (customApiUrl || 'https://api.telegram.org').trim().replace(/\/+$/, '');
  const isDefaultHost = !customApiUrl || rawBase === 'https://api.telegram.org';
  const path = `/bot${cleanToken}/${method}`;
  const targetUrl = `${rawBase}${path}`;
  const bodyData = JSON.stringify(payload);

  // Strategy 1: Standard fetch
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 8000);

    const res = await fetch(targetUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: bodyData,
      signal: controller.signal,
    });
    clearTimeout(timer);

    const data = (await res.json()) as { ok?: boolean; description?: string };
    if (!res.ok || !data.ok) {
      return { ok: false, error: data.description || `HTTP ${res.status}` };
    }
    return { ok: true };
  } catch (fetchErr: any) {
    // If not using default Telegram API, return the fetch error
    if (!isDefaultHost) {
      const msg = fetchErr?.message || String(fetchErr);
      return { ok: false, error: `Ошибка подключения к прокси (${msg})` };
    }

    // Strategy 2: Direct HTTPS socket forcing IPv4 for api.telegram.org
    return new Promise((resolve) => {
      const req = https.request(
        {
          host: 'api.telegram.org',
          port: 443,
          path,
          method: 'POST',
          family: 4, // Explicitly force IPv4 socket
          headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(bodyData),
          },
          timeout: 10000,
        },
        (res) => {
          let raw = '';
          res.on('data', (chunk) => (raw += chunk));
          res.on('end', () => {
            try {
              const data = JSON.parse(raw);
              if (res.statusCode !== 200 || !data.ok) {
                resolve({ ok: false, error: data.description || `HTTP ${res.statusCode}` });
              } else {
                resolve({ ok: true });
              }
            } catch {
              resolve({ ok: false, error: `Некорректный ответ Telegram (HTTP ${res.statusCode})` });
            }
          });
        }
      );

      req.on('timeout', () => {
        req.destroy();
        resolve({
          ok: false,
          error: 'Таймаут подключения: сервер не смог связаться с api.telegram.org за 10 сек (ограничение РКН/сети)',
        });
      });

      req.on('error', (netErr: any) => {
        const cause = netErr?.code || netErr?.message || String(netErr);
        resolve({
          ok: false,
          error: `Сетевая ошибка (${cause}). Проверьте доступность Telegram с сервера.`,
        });
      });

      req.write(bodyData);
      req.end();
    });
  }
}

export async function sendTelegramMessage(
  text: string,
  chatId: string,
  tokenOverride?: string,
  apiUrlOverride?: string
): Promise<{ ok: boolean; error?: string }> {
  const config = await getTelegramConfig();
  const token = (tokenOverride || config.token || '').trim();
  const apiUrl = (apiUrlOverride || config.apiUrl || 'https://api.telegram.org').trim();

  if (!token) {
    return { ok: false, error: 'Токен Telegram бота не настроен' };
  }
  if (!chatId || !chatId.trim()) {
    return { ok: false, error: 'Telegram Chat ID не указан' };
  }

  return postTelegramApi(
    token,
    'sendMessage',
    {
      chat_id: chatId.trim(),
      text,
      parse_mode: 'HTML',
      disable_web_page_preview: true,
    },
    apiUrl
  );
}

export async function sendTelegramNotification(
  data: OrderNotificationData
): Promise<{ ok: boolean; sent: number; total: number; error?: string }> {
  const config = await getTelegramConfig();
  if (!config.enabled) {
    return { ok: true, sent: 0, total: 0 };
  }
  if (!config.token) {
    return { ok: false, sent: 0, total: 0, error: 'Токен Telegram бота не настроен' };
  }

  const activeRecipients = config.recipients.filter((r) => r.enabled !== false && r.id.trim());
  if (activeRecipients.length === 0) {
    return { ok: false, sent: 0, total: 0, error: 'Нет активных получателей Telegram' };
  }

  const text = formatTelegramMessage(data);
  let sent = 0;
  const errors: string[] = [];

  for (const r of activeRecipients) {
    const res = await sendTelegramMessage(text, r.id, config.token, config.apiUrl);
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

export async function testTelegram(
  chatId?: string,
  token?: string,
  apiUrl?: string,
  recipientsList?: BotRecipient[]
): Promise<{ ok: boolean; error?: string; sent?: number; total?: number; details?: Record<string, { ok: boolean; error?: string }> }> {
  const text =
    '✅ <b>Тестовое оповещение от Kiprol Bot</b>\n\n' +
    'Связь между сайтом <code>kiprol.ru</code> и Telegram успешно настроена! ' +
    'Новые заявки и заказы будут приходить сюда в реальном времени.';

  // If testing a single recipient
  if (chatId) {
    const res = await sendTelegramMessage(text, chatId, token, apiUrl);
    return {
      ok: res.ok,
      error: res.error,
      sent: res.ok ? 1 : 0,
      total: 1,
      details: { [chatId]: res },
    };
  }

  // If testing multiple recipients
  const config = await getTelegramConfig();
  const activeToken = token || config.token;
  const activeApiUrl = apiUrl || config.apiUrl;
  const list = recipientsList && recipientsList.length > 0
    ? recipientsList.filter((r) => r.enabled !== false && r.id.trim())
    : config.recipients.filter((r) => r.enabled !== false && r.id.trim());

  if (list.length === 0) {
    return { ok: false, error: 'Список получателей пуст' };
  }

  let sent = 0;
  const details: Record<string, { ok: boolean; error?: string }> = {};
  const errors: string[] = [];

  for (const r of list) {
    const res = await sendTelegramMessage(text, r.id, activeToken, activeApiUrl);
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
