import type { OrderStatus } from './types';

export const ORDER_STATUSES: OrderStatus[] = ['new', 'processing', 'shipped', 'done', 'canceled'];

export const ORDER_STAT_LABEL: Record<OrderStatus, { ru: string; en: string }> = {
  new: { ru: 'Новый', en: 'New' },
  processing: { ru: 'В работе', en: 'Processing' },
  shipped: { ru: 'Отправлен', en: 'Shipped' },
  done: { ru: 'Завершён', en: 'Done' },
  canceled: { ru: 'Отменён', en: 'Canceled' },
};
