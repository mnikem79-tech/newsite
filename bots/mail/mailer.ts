import nodemailer from 'nodemailer';
import { getContentCached } from '@/lib/db';
import type { OrderNotificationData } from '../types';
import type { MailConfig, EmailRecipient } from './types';
import { formatEmailHtml, formatEmailText } from './templates';

export async function getMailConfig(): Promise<MailConfig> {
  let enabled = true;
  let host = (process.env.MAIL_HOST || process.env.SMTP_HOST || 'mail.newsite.nail-app.ru').trim();
  let port = Number(process.env.MAIL_PORT || process.env.SMTP_PORT) || 465;
  let secure = process.env.MAIL_SECURE === 'true' || port === 465;
  let user = (process.env.MAIL_USER || process.env.SMTP_USER || 'zakaz@newsite.nail-app.ru').trim();
  let pass = (process.env.MAIL_PASS || process.env.SMTP_PASS || '').trim();
  let from = (process.env.MAIL_FROM || process.env.SMTP_FROM || 'Новый сайт <zakaz@newsite.nail-app.ru>').trim();
  let recipients: EmailRecipient[] = [];

  try {
    const notif = (await getContentCached('notifications')) as Record<string, any> | null;
    if (notif) {
      if (typeof notif.mail_enabled === 'boolean') enabled = notif.mail_enabled;
      if (notif.mail_host) host = String(notif.mail_host).trim();
      if (notif.mail_port) port = Number(notif.mail_port) || 465;
      if (typeof notif.mail_secure === 'boolean') {
        secure = notif.mail_secure;
      } else {
        secure = port === 465;
      }
      if (notif.mail_user) user = String(notif.mail_user).trim();
      if (notif.mail_pass) pass = String(notif.mail_pass).trim();
      if (notif.mail_from) from = String(notif.mail_from).trim();
      if (Array.isArray(notif.mail_recipients)) {
        recipients = notif.mail_recipients
          .filter((r: any) => r && typeof r.email === 'string' && r.email.trim())
          .map((r: any) => ({
            email: String(r.email).trim(),
            name: typeof r.name === 'string' ? r.name.trim() : '',
            enabled: r.enabled !== false,
          }));
      }
    }
  } catch {
    // ignore
  }

  // Fallbacks if recipients empty
  if (recipients.length === 0) {
    const envRecipients = (process.env.MAIL_RECIPIENTS || process.env.NOTIFICATION_EMAILS || '').trim();
    if (envRecipients) {
      const parts = envRecipients.split(/[,;\s]+/);
      for (const p of parts) {
        if (p.includes('@')) {
          recipients.push({ email: p.trim(), name: 'Основной', enabled: true });
        }
      }
    }
  }

  // Default fallback if still empty
  if (recipients.length === 0) {
    recipients.push({ email: 'nikem79@yandex.ru', name: 'Николай', enabled: true });
  }

  return { enabled, host, port, secure, user, pass, from, recipients };
}

export async function sendMailMessage(
  to: string,
  subject: string,
  html: string,
  text: string,
  configOverride?: Partial<MailConfig>
): Promise<{ ok: boolean; error?: string }> {
  const cfg = await getMailConfig();
  const host = (configOverride?.host || cfg.host || 'mail.newsite.nail-app.ru').trim();
  const port = Number(configOverride?.port || cfg.port || 465);
  const secure =
    configOverride?.secure !== undefined ? configOverride.secure : port === 465;
  const user = (configOverride?.user || cfg.user || 'zakaz@newsite.nail-app.ru').trim();
  const pass = (configOverride?.pass || cfg.pass || '').trim();
  const from = (configOverride?.from || cfg.from || 'Новый сайт <zakaz@newsite.nail-app.ru>').trim();

  if (!to || !to.includes('@')) {
    return { ok: false, error: 'Некорректный email получателя' };
  }

  try {
    const transportOptions: Record<string, any> = {
      host,
      port,
      secure,
      connectionTimeout: 10000,
      greetingTimeout: 10000,
      socketTimeout: 15000,
      tls: {
        rejectUnauthorized: false, // Allows self-signed or host-named certificates on mail.newsite.nail-app.ru
      },
    };

    if (user && pass) {
      transportOptions.auth = { user, pass };
    }

    const transporter = nodemailer.createTransport(transportOptions as any);

    await transporter.sendMail({
      from,
      to: to.trim(),
      subject,
      text,
      html,
    });

    return { ok: true };
  } catch (err: any) {
    const errMsg = err?.message || String(err);
    console.error('[Mail Send Error]:', errMsg);
    return { ok: false, error: errMsg };
  }
}

export async function sendMailNotification(
  data: OrderNotificationData
): Promise<{ ok: boolean; sent: number; total: number; error?: string }> {
  const config = await getMailConfig();
  if (!config.enabled) {
    return { ok: true, sent: 0, total: 0 };
  }

  const activeRecipients = config.recipients.filter(
    (r) => r.enabled !== false && r.email.trim() && r.email.includes('@')
  );
  if (activeRecipients.length === 0) {
    return { ok: false, sent: 0, total: 0, error: 'Нет активных получателей почты' };
  }

  const isOrder = Array.isArray(data.items) && data.items.length > 0;
  const subject = isOrder
    ? `🛒 Новый заказ ${data.number}: ${data.name}`
    : `🔔 Новая заявка с сайта newsite.nail-app.ru: ${data.name} (${data.phone})`;

  const html = formatEmailHtml(data);
  const text = formatEmailText(data);

  let sent = 0;
  const errors: string[] = [];

  for (const r of activeRecipients) {
    const res = await sendMailMessage(r.email, subject, html, text, config);
    if (res.ok) {
      sent++;
    } else {
      errors.push(`${r.name || r.email}: ${res.error}`);
    }
  }

  return {
    ok: sent > 0,
    sent,
    total: activeRecipients.length,
    error: errors.length ? errors.join('; ') : undefined,
  };
}

export async function testMail(
  to?: string,
  configOverride?: Partial<MailConfig>,
  recipientsList?: EmailRecipient[]
): Promise<{
  ok: boolean;
  error?: string;
  sent?: number;
  total?: number;
  details?: Record<string, { ok: boolean; error?: string }>;
}> {
  const fromAddress = configOverride?.from || 'zakaz@newsite.nail-app.ru';
  const subject = '✅ Тестовое оповещение от сайта newsite.nail-app.ru';
  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; color: #1e293b;">
      <div style="background: #0b1322; padding: 20px; border-radius: 8px; margin-bottom: 20px; text-align: center;">
        <h2 style="color: #25c3d6; margin: 0; font-size: 20px; letter-spacing: 0.5px;">Новый сайт</h2>
        <div style="color: #94a3b8; font-size: 13px; margin-top: 4px;">Служба email-оповещений (${fromAddress})</div>
      </div>
      <h3 style="color: #10b981; margin-top: 0;">✅ Тестовое письмо успешно доставлено!</h3>
      <p style="font-size: 14.5px; line-height: 1.6; color: #334155;">
        Почтовая служба сайта <b>newsite.nail-app.ru</b> успешно настроена. Отправка выполняется с адреса <b>${fromAddress}</b>.
      </p>
      <p style="font-size: 14px; line-height: 1.6; color: #64748b;">
        Все новые заявки и заказы с сайта будут автоматически приходить на указанные в панели управления адреса сотрудников.
      </p>
      <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
      <div style="font-size: 12px; color: #94a3b8; text-align: center;">
        Новый сайт • <a href="https://newsite.nail-app.ru" style="color: #25c3d6; text-decoration: none;">newsite.nail-app.ru</a>
      </div>
    </div>
  `;
  const text =
    '✅ Тестовое оповещение от сайта newsite.nail-app.ru\n\n' +
    `Почтовая служба сайта newsite.nail-app.ru успешно настроена!\n` +
    `Письмо отправлено с адреса ${fromAddress}.\n` +
    'Все новые заказы и заявки с сайта будут приходить сюда в реальном времени.';

  // If testing single recipient
  if (to) {
    const res = await sendMailMessage(to, subject, html, text, configOverride);
    return {
      ok: res.ok,
      error: res.error,
      sent: res.ok ? 1 : 0,
      total: 1,
      details: { [to]: res },
    };
  }

  // If testing multiple recipients
  const cfg = await getMailConfig();
  const list =
    recipientsList && recipientsList.length > 0
      ? recipientsList.filter((r) => r.enabled !== false && r.email.trim() && r.email.includes('@'))
      : cfg.recipients.filter((r) => r.enabled !== false && r.email.trim() && r.email.includes('@'));

  if (list.length === 0) {
    return { ok: false, error: 'Список получателей почты пуст' };
  }

  let sent = 0;
  const details: Record<string, { ok: boolean; error?: string }> = {};
  const errors: string[] = [];

  for (const r of list) {
    const res = await sendMailMessage(r.email, subject, html, text, configOverride);
    details[r.email] = res;
    if (res.ok) {
      sent++;
    } else {
      errors.push(`${r.name || r.email}: ${res.error}`);
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
