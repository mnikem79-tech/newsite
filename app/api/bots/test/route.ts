import { NextResponse } from 'next/server';
import { parseSessionToken, SESSION_COOKIE } from '@/lib/auth';
import { cookies } from 'next/headers';
import {
  testTelegram,
  testVk,
  testMail,
  getTelegramConfig,
  getVkConfig,
  getMailConfig,
} from '@/bots';
import type { BotRecipient, EmailRecipient } from '@/bots/types';

export const dynamic = 'force-dynamic';

async function adminId(): Promise<number | null> {
  const c = await cookies();
  return parseSessionToken(c.get(SESSION_COOKIE)?.value);
}

// POST /api/bots/test — admin only: send test notification
export async function POST(req: Request) {
  const uid = await adminId();
  if (!uid) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  let body: {
    target?: 'telegram' | 'vk' | 'mail' | 'email' | 'all';
    chatId?: string;
    peerId?: string;
    email?: string;
    token?: string;
    apiUrl?: string;
    recipients?: BotRecipient[];
    mailRecipients?: EmailRecipient[];
    mailHost?: string;
    mailPort?: number;
    mailSecure?: boolean;
    mailUser?: string;
    mailPass?: string;
    mailFrom?: string;
  } = {};

  try {
    body = await req.json();
  } catch {
    // empty body is fine
  }

  const target = body.target || 'all';
  const results: Record<string, any> = {};

  if (target === 'telegram' || target === 'all') {
    results.telegram = await testTelegram(
      body.chatId,
      body.token,
      body.apiUrl,
      body.recipients
    );
  }

  if (target === 'vk' || target === 'all') {
    results.vk = await testVk(
      body.peerId,
      body.token,
      body.recipients
    );
  }

  if (target === 'mail' || target === 'email' || target === 'all') {
    results.mail = await testMail(
      body.email,
      {
        host: body.mailHost,
        port: body.mailPort,
        secure: body.mailSecure,
        user: body.mailUser,
        pass: body.mailPass,
        from: body.mailFrom,
      },
      body.mailRecipients
    );
  }

  const tgConfig = await getTelegramConfig();
  const vkConfig = await getVkConfig();
  const mailConfig = await getMailConfig();

  const allOk = Object.values(results).every((r) => r && r.ok);
  return NextResponse.json({
    ok: allOk,
    results,
    configured: {
      telegram: Boolean(tgConfig.token && tgConfig.recipients.length > 0),
      vk: Boolean(vkConfig.token && vkConfig.recipients.length > 0),
      mail: Boolean(mailConfig.recipients.length > 0),
    },
  });
}

// GET /api/bots/test — check status of bot configurations
export async function GET() {
  const uid = await adminId();
  if (!uid) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const tg = await getTelegramConfig();
  const vk = await getVkConfig();
  const mail = await getMailConfig();

  return NextResponse.json({
    telegram: {
      enabled: tg.enabled,
      hasToken: Boolean(tg.token),
      apiUrl: tg.apiUrl,
      recipientsCount: tg.recipients.filter((r) => r.enabled !== false).length,
    },
    vk: {
      enabled: vk.enabled,
      hasToken: Boolean(vk.token),
      recipientsCount: vk.recipients.filter((r) => r.enabled !== false).length,
    },
    mail: {
      enabled: mail.enabled,
      host: mail.host,
      port: mail.port,
      from: mail.from,
      recipientsCount: mail.recipients.filter((r) => r.enabled !== false).length,
    },
  });
}
