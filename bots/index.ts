import { sendTelegramNotification, testTelegram, getTelegramConfig } from './telegram';
import { sendVkNotification, testVk, getVkConfig } from './vk';
import { sendMailNotification, testMail, getMailConfig } from './mail';
import type { OrderNotificationData } from './types';

export * from './types';
export * from './telegram';
export * from './vk';
export * from './mail';

/**
 * Dispatch notification for a new order / lead to Telegram, VK and Corporate Email.
 * Runs non-blocking and handles failures gracefully without failing the user request.
 */
export async function notifyNewOrder(
  data: OrderNotificationData
): Promise<{ telegram: boolean; vk: boolean; mail: boolean }> {
  const result = { telegram: false, vk: false, mail: false };

  const promises: Promise<void>[] = [];

  // 1. Telegram
  try {
    const tgConfig = await getTelegramConfig();
    const hasTgRecipients = tgConfig.recipients.some((r) => r.enabled !== false && r.id.trim());
    if (tgConfig.enabled && tgConfig.token && hasTgRecipients) {
      promises.push(
        sendTelegramNotification(data)
          .then((res) => {
            result.telegram = res.ok;
            if (res.ok) {
              console.log(`[Notification] Order ${data.number} sent to Telegram (${res.sent}/${res.total} recipients)`);
            } else {
              console.warn(`[Notification] Failed to send ${data.number} to Telegram:`, res.error);
            }
          })
          .catch((err) => {
            console.error('[Notification] Telegram unexpected error:', err);
          })
      );
    }
  } catch (err) {
    console.error('[Notification] Error reading Telegram config:', err);
  }

  // 2. VK
  try {
    const vkConfig = await getVkConfig();
    const hasVkRecipients = vkConfig.recipients.some((r) => r.enabled !== false && r.id.trim());
    if (vkConfig.enabled && vkConfig.token && hasVkRecipients) {
      promises.push(
        sendVkNotification(data)
          .then((res) => {
            result.vk = res.ok;
            if (res.ok) {
              console.log(`[Notification] Order ${data.number} sent to VK (${res.sent}/${res.total} recipients)`);
            } else {
              console.warn(`[Notification] Failed to send ${data.number} to VK:`, res.error);
            }
          })
          .catch((err) => {
            console.error('[Notification] VK unexpected error:', err);
          })
      );
    }
  } catch (err) {
    console.error('[Notification] Error reading VK config:', err);
  }

  // 3. Corporate Email (zakaz@kiprol.ru via bots/mail)
  try {
    const mailConfig = await getMailConfig();
    const hasMailRecipients = mailConfig.recipients.some((r) => r.enabled !== false && r.email.trim());
    if (mailConfig.enabled && hasMailRecipients) {
      promises.push(
        sendMailNotification(data)
          .then((res) => {
            result.mail = res.ok;
            if (res.ok) {
              console.log(`[Notification] Order ${data.number} sent to Email (${res.sent}/${res.total} recipients)`);
            } else {
              console.warn(`[Notification] Failed to send ${data.number} to Email:`, res.error);
            }
          })
          .catch((err) => {
            console.error('[Notification] Email unexpected error:', err);
          })
      );
    }
  } catch (err) {
    console.error('[Notification] Error reading Mail config:', err);
  }

  await Promise.allSettled(promises);
  return result;
}
