import type { OrderNotificationData } from '../types';

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function formatPrice(n: number): string {
  return new Intl.NumberFormat('ru-RU').format(n);
}

export function formatEmailHtml(data: OrderNotificationData): string {
  const isOrder = Array.isArray(data.items) && data.items.length > 0;
  const title = isOrder ? 'Новый заказ с сайта kiprol.ru' : 'Новая заявка с сайта kiprol.ru';

  let itemsHtml = '';
  if (isOrder && data.items && data.items.length > 0) {
    const rows = data.items
      .map((it, idx) => {
        const sumStr =
          it.price != null && it.price > 0
            ? `${formatPrice(it.price * it.quantity)} ₽`
            : '—';
        const priceStr =
          it.price != null && it.price > 0 ? `${formatPrice(it.price)} ₽` : 'по запросу';
        return `
          <tr style="border-bottom: 1px solid #e2e8f0;">
            <td style="padding: 10px 12px; color: #64748b; font-size: 13px;">${idx + 1}</td>
            <td style="padding: 10px 12px; font-weight: 600; color: #1e293b; font-size: 14px;">${escapeHtml(it.product_name)}</td>
            <td style="padding: 10px 12px; text-align: center; color: #1e293b; font-size: 14px;">${it.quantity} шт.</td>
            <td style="padding: 10px 12px; text-align: right; color: #64748b; font-size: 13px;">${priceStr}</td>
            <td style="padding: 10px 12px; text-align: right; font-weight: 700; color: #0f172a; font-size: 14px;">${sumStr}</td>
          </tr>
        `;
      })
      .join('');

    const totalRow =
      data.total != null && data.total > 0
        ? `
        <div style="margin-top: 16px; padding: 14px 18px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; text-align: right;">
          <span style="font-size: 14px; color: #64748b; margin-right: 12px;">Итоговая сумма заказа:</span>
          <span style="font-size: 20px; font-weight: 800; color: #0284c7;">${formatPrice(data.total)} ₽</span>
        </div>
      `
        : '';

    itemsHtml = `
      <h3 style="font-size: 16px; font-weight: 700; color: #0f172a; margin: 24px 0 12px;">📦 Содержимое заказа:</h3>
      <table style="width: 100%; border-collapse: collapse; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
        <thead>
          <tr style="background: #f1f5f9; text-align: left; font-size: 12px; text-transform: uppercase; color: #64748b; letter-spacing: 0.5px;">
            <th style="padding: 10px 12px;">№</th>
            <th style="padding: 10px 12px;">Наименование</th>
            <th style="padding: 10px 12px; text-align: center;">Кол-во</th>
            <th style="padding: 10px 12px; text-align: right;">Цена</th>
            <th style="padding: 10px 12px; text-align: right;">Сумма</th>
          </tr>
        </thead>
        <tbody>
          ${rows}
        </tbody>
      </table>
      ${totalRow}
    `;
  }

  const fields: { label: string; val?: string | null }[] = [
    { label: 'Номер заказа / заявки', val: data.number },
    { label: 'Контактное лицо', val: data.name },
    { label: 'Телефон', val: data.phone },
    { label: 'Электронная почта', val: data.email },
    { label: 'Компания / Организация', val: data.company },
    { label: 'Адрес доставки', val: data.address },
    { label: 'Способ оплаты', val: data.payment },
    { label: 'Комментарий к заказу', val: data.comment },
  ];

  const infoRows = fields
    .filter((f) => f.val && String(f.val).trim())
    .map(
      (f) => `
      <tr style="border-bottom: 1px solid #f1f5f9;">
        <td style="padding: 9px 12px; color: #64748b; font-size: 13.5px; width: 170px; vertical-align: top;">${escapeHtml(f.label)}:</td>
        <td style="padding: 9px 12px; color: #0f172a; font-size: 14px; font-weight: 600; vertical-align: top;">${escapeHtml(String(f.val))}</td>
      </tr>
    `
    )
    .join('');

  const adminLink = data.id
    ? `
      <div style="margin-top: 24px; text-align: center;">
        <a href="https://kiprol.ru/admin/orders/${data.id}" style="display: inline-block; background: #0284c7; color: #ffffff; padding: 12px 26px; border-radius: 8px; font-weight: 700; font-size: 14px; text-decoration: none;">
          Открыть заказ в панели управления →
        </a>
      </div>
    `
    : '';

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>${escapeHtml(title)}</title>
      </head>
      <body style="margin: 0; padding: 24px 12px; background: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #1e293b;">
        <div style="max-width: 640px; margin: 0 auto; background: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
          <!-- Header -->
          <div style="background: #0b1322; padding: 24px; text-align: center; border-bottom: 3px solid #25c3d6;">
            <div style="font-size: 22px; font-weight: 800; color: #ffffff; letter-spacing: 0.5px;">
              НПО <span style="color: #25c3d6;">КИПРОЛ</span>
            </div>
            <div style="color: #94a3b8; font-size: 13px; margin-top: 4px;">
              ${escapeHtml(title)} • № ${escapeHtml(data.number)}
            </div>
          </div>

          <!-- Body -->
          <div style="padding: 24px;">
            <h2 style="font-size: 18px; font-weight: 700; color: #0f172a; margin-top: 0; margin-bottom: 16px;">
              ${isOrder ? '🛒 Оформлен новый заказ' : '🔔 Получена новая заявка'}
            </h2>

            <table style="width: 100%; border-collapse: collapse; margin-bottom: 16px;">
              <tbody>
                ${infoRows}
              </tbody>
            </table>

            ${itemsHtml}
            ${adminLink}
          </div>

          <!-- Footer -->
          <div style="background: #f1f5f9; padding: 16px 24px; text-align: center; font-size: 12px; color: #64748b; border-top: 1px solid #e2e8f0;">
            НПО КИПРОЛ • г. Тольятти • <a href="https://kiprol.ru" style="color: #0284c7; text-decoration: none;">kiprol.ru</a>
          </div>
        </div>
      </body>
    </html>
  `;
}

export function formatEmailText(data: OrderNotificationData): string {
  const isOrder = Array.isArray(data.items) && data.items.length > 0;
  const title = isOrder ? 'НОВЫЙ ЗАКАЗ С САЙТА KIPROL.RU' : 'НОВАЯ ЗАЯВКА С САЙТА KIPROL.RU';

  const lines: string[] = [
    title,
    `Номер: ${data.number}`,
    `Имя: ${data.name}`,
    `Телефон: ${data.phone}`,
  ];

  if (data.email) lines.push(`Email: ${data.email}`);
  if (data.company) lines.push(`Компания: ${data.company}`);
  if (data.address) lines.push(`Адрес: ${data.address}`);
  if (data.payment) lines.push(`Оплата: ${data.payment}`);
  if (data.comment) lines.push(`Сообщение:\n${data.comment}`);

  if (isOrder && data.items) {
    lines.push('');
    lines.push('Содержимое заказа:');
    data.items.forEach((it, idx) => {
      const priceStr =
        it.price != null && it.price > 0
          ? ` — ${formatPrice(it.price * it.quantity)} ₽`
          : '';
      lines.push(`${idx + 1}. ${it.product_name} × ${it.quantity} шт.${priceStr}`);
    });

    if (data.total != null && data.total > 0) {
      lines.push(`\nИтоговая сумма: ${formatPrice(data.total)} ₽`);
    }
  }

  if (data.id) {
    lines.push('');
    lines.push(`Админка: https://kiprol.ru/admin/orders/${data.id}`);
  }

  return lines.join('\n');
}
