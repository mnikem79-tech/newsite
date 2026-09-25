'use client';

import { useState } from 'react';
import type { BotNotificationsConfig, BotRecipient, EmailRecipient } from '@/bots/types';

interface Props {
  initial: BotNotificationsConfig;
}

export default function NotificationsClient({ initial }: Props) {
  const [config, setConfig] = useState<BotNotificationsConfig>(initial);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const [showTgToken, setShowTgToken] = useState(false);
  const [showVkToken, setShowVkToken] = useState(false);
  const [showMailPass, setShowMailPass] = useState(false);

  // Testing states
  const [testingTgAll, setTestingTgAll] = useState(false);
  const [testingVkAll, setTestingVkAll] = useState(false);
  const [testingMailAll, setTestingMailAll] = useState(false);
  const [testingRecipientId, setTestingRecipientId] = useState<string | null>(null);

  // Test results per recipient: id -> status
  const [recipientResults, setRecipientResults] = useState<
    Record<string, { ok: boolean; text: string }>
  >({});
  const [batchResults, setBatchResults] = useState<{
    telegram?: { ok: boolean; text: string };
    vk?: { ok: boolean; text: string };
    mail?: { ok: boolean; text: string };
  }>({});

  // Recipient modifiers
  const addRecipient = (target: 'telegram' | 'vk' | 'mail') => {
    if (target === 'telegram') {
      setConfig((prev) => ({
        ...prev,
        telegram_recipients: [
          ...prev.telegram_recipients,
          { id: '', name: '', enabled: true },
        ],
      }));
    } else if (target === 'vk') {
      setConfig((prev) => ({
        ...prev,
        vk_recipients: [
          ...prev.vk_recipients,
          { id: '', name: '', enabled: true },
        ],
      }));
    } else {
      setConfig((prev) => ({
        ...prev,
        mail_recipients: [
          ...prev.mail_recipients,
          { email: '', name: '', enabled: true },
        ],
      }));
    }
  };

  const removeRecipient = (target: 'telegram' | 'vk' | 'mail', idx: number) => {
    if (target === 'telegram') {
      setConfig((prev) => ({
        ...prev,
        telegram_recipients: prev.telegram_recipients.filter((_, i) => i !== idx),
      }));
    } else if (target === 'vk') {
      setConfig((prev) => ({
        ...prev,
        vk_recipients: prev.vk_recipients.filter((_, i) => i !== idx),
      }));
    } else {
      setConfig((prev) => ({
        ...prev,
        mail_recipients: prev.mail_recipients.filter((_, i) => i !== idx),
      }));
    }
  };

  const updateRecipient = (
    target: 'telegram' | 'vk' | 'mail',
    idx: number,
    field: string,
    val: any
  ) => {
    if (target === 'telegram') {
      setConfig((prev) => {
        const next = [...prev.telegram_recipients];
        next[idx] = { ...next[idx], [field]: val };
        return { ...prev, telegram_recipients: next };
      });
    } else if (target === 'vk') {
      setConfig((prev) => {
        const next = [...prev.vk_recipients];
        next[idx] = { ...next[idx], [field]: val };
        return { ...prev, vk_recipients: next };
      });
    } else {
      setConfig((prev) => {
        const next = [...prev.mail_recipients];
        next[idx] = { ...next[idx], [field]: val };
        return { ...prev, mail_recipients: next };
      });
    }
  };

  // Test single recipient
  const handleTestRecipient = async (target: 'telegram' | 'vk' | 'mail', item: any) => {
    const rawId = target === 'mail' ? item.email : item.id;
    if (!rawId || !rawId.trim()) {
      alert(target === 'mail' ? 'Укажите email получателя' : 'Укажите ID получателя');
      return;
    }
    const key = `${target}:${rawId.trim()}`;
    setTestingRecipientId(key);
    try {
      const res = await fetch('/api/bots/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          target,
          token: target === 'telegram' ? config.telegram_bot_token : config.vk_bot_token,
          apiUrl: target === 'telegram' ? config.telegram_api_url : undefined,
          chatId: target === 'telegram' ? rawId.trim() : undefined,
          peerId: target === 'vk' ? rawId.trim() : undefined,
          email: target === 'mail' ? rawId.trim() : undefined,
          mailHost: config.mail_host,
          mailPort: config.mail_port,
          mailSecure: config.mail_secure,
          mailUser: config.mail_user,
          mailPass: config.mail_pass,
          mailFrom: config.mail_from,
        }),
      });
      const data = await res.json();
      const resItem = data.results?.[target];
      if (resItem?.ok) {
        setRecipientResults((prev) => ({
          ...prev,
          [key]: {
            ok: true,
            text: target === 'mail' ? '✅ Письмо успешно отправлено!' : '✅ Сообщение успешно доставлено!',
          },
        }));
      } else {
        setRecipientResults((prev) => ({
          ...prev,
          [key]: { ok: false, text: `❌ ${resItem?.error || 'Ошибка отправки'}` },
        }));
      }
    } catch (e: any) {
      setRecipientResults((prev) => ({
        ...prev,
        [key]: { ok: false, text: `❌ Ошибка сети: ${e?.message || e}` },
      }));
    } finally {
      setTestingRecipientId(null);
    }
  };

  // Test all recipients of a platform
  const handleTestAll = async (target: 'telegram' | 'vk' | 'mail') => {
    if (target === 'telegram') setTestingTgAll(true);
    else if (target === 'vk') setTestingVkAll(true);
    else setTestingMailAll(true);

    try {
      const recipients = target === 'telegram' ? config.telegram_recipients : config.vk_recipients;
      const res = await fetch('/api/bots/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          target,
          token: target === 'telegram' ? config.telegram_bot_token : config.vk_bot_token,
          apiUrl: target === 'telegram' ? config.telegram_api_url : undefined,
          recipients: target !== 'mail' ? recipients : undefined,
          mailRecipients: target === 'mail' ? config.mail_recipients : undefined,
          mailHost: config.mail_host,
          mailPort: config.mail_port,
          mailSecure: config.mail_secure,
          mailUser: config.mail_user,
          mailPass: config.mail_pass,
          mailFrom: config.mail_from,
        }),
      });
      const data = await res.json();
      const resItem = data.results?.[target];

      // Update per-recipient badges if details provided
      if (resItem?.details) {
        const nextResults: Record<string, { ok: boolean; text: string }> = {};
        for (const [id, r] of Object.entries(resItem.details as Record<string, any>)) {
          nextResults[`${target}:${id}`] = {
            ok: r.ok,
            text: r.ok ? '✅ Доставлено' : `❌ ${r.error || 'Ошибка'}`,
          };
        }
        setRecipientResults((prev) => ({ ...prev, ...nextResults }));
      }

      if (resItem?.ok) {
        setBatchResults((prev) => ({
          ...prev,
          [target]: {
            ok: true,
            text: `✅ Успешно отправлено: ${resItem.sent} из ${resItem.total} получателей`,
          },
        }));
      } else {
        setBatchResults((prev) => ({
          ...prev,
          [target]: {
            ok: false,
            text: `❌ Ошибка: ${resItem?.error || 'Не удалось отправить сообщения'}`,
          },
        }));
      }
    } catch (e: any) {
      setBatchResults((prev) => ({
        ...prev,
        [target]: {
          ok: false,
          text: `❌ Ошибка сети: ${e?.message || e}`,
        },
      }));
    } finally {
      if (target === 'telegram') setTestingTgAll(false);
      else if (target === 'vk') setTestingVkAll(false);
      else setTestingMailAll(false);
    }
  };

  // Save settings
  const handleSave = async () => {
    setSaving(true);
    setMsg(null);
    try {
      const res = await fetch('/api/content/notifications', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d.error || 'Ошибка сохранения');
      }
      setMsg({ ok: true, text: '✅ Настройки оповещений успешно сохранены!' });
    } catch (e: any) {
      setMsg({ ok: false, text: `❌ Ошибка при сохранении: ${e?.message || e}` });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ maxWidth: 1040 }}>
      {/* Top Header */}
      <div className="a-head">
        <div>
          <h1>🔔 Оповещения (Почта zakaz@newsite.nail-app.ru, TG, VK)</h1>
          <div className="sub">
            Настройка автоматической рассылки новых заявок и заказов сотрудникам компании
          </div>
        </div>
        <button className="btn primary" onClick={handleSave} disabled={saving}>
          {saving ? 'Сохранение…' : '💾 Сохранить настройки'}
        </button>
      </div>

      {msg && (
        <div className={`alert ${msg.ok ? 'ok' : 'err'}`} style={{ marginBottom: 20 }}>
          {msg.text}
        </div>
      )}

      {/* ========================================================
          CARD 1: СОБСТВЕННАЯ ПОЧТА (zakaz@newsite.nail-app.ru)
          ======================================================== */}
      <div className="a-card" style={{ marginBottom: 26 }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 16,
            marginBottom: 16,
            flexWrap: 'wrap',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: 28 }}>✉️</span>
            <div>
              <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800 }}>
                Корпоративная почта (zakaz@newsite.nail-app.ru)
              </h3>
              <div style={{ color: 'var(--muted)', fontSize: 13, marginTop: 2 }}>
                Отправка писем через официальный почтовый сервер reg.ru с адреса zakaz@newsite.nail-app.ru (модуль bots/mail)
              </div>
            </div>
          </div>
          <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', fontWeight: 700, fontSize: 14 }}>
            <input
              type="checkbox"
              checked={config.mail_enabled}
              onChange={(e) => setConfig((p) => ({ ...p, mail_enabled: e.target.checked }))}
              style={{ width: 18, height: 18, accentColor: 'var(--acc)' }}
            />
            {config.mail_enabled ? (
              <span style={{ color: 'var(--green)' }}>● Оповещения включены</span>
            ) : (
              <span style={{ color: 'var(--muted)' }}>○ Выключены</span>
            )}
          </label>
        </div>

        <div className="frow" style={{ marginBottom: 14 }}>
          <div className="field" style={{ flex: 1.8 }}>
            <label>Почтовый сервер (хост)</label>
            <input
              value={config.mail_host}
              placeholder="mail.newsite.nail-app.ru"
              onChange={(e) => setConfig((p) => ({ ...p, mail_host: e.target.value }))}
            />
          </div>
          <div className="field" style={{ flex: 1 }}>
            <label>Порт</label>
            <input
              type="number"
              value={config.mail_port}
              placeholder="465"
              onChange={(e) => {
                const port = Number(e.target.value);
                setConfig((p) => ({
                  ...p,
                  mail_port: port,
                  mail_secure: port === 465,
                }));
              }}
            />
          </div>
          <div className="field" style={{ flex: 1.2 }}>
            <label>Шифрование</label>
            <select
              value={config.mail_secure ? 'ssl' : 'tls'}
              onChange={(e) => {
                const isSsl = e.target.value === 'ssl';
                setConfig((p) => ({
                  ...p,
                  mail_secure: isSsl,
                  mail_port: isSsl ? 465 : (p.mail_port === 465 ? 587 : p.mail_port),
                }));
              }}
              style={{ height: 42 }}
            >
              <option value="ssl">SSL (порт 465 — рекомендуется)</option>
              <option value="tls">STARTTLS (порт 587)</option>
              <option value="plain">Без шифрования (порт 25)</option>
            </select>
          </div>
        </div>

        <div className="frow" style={{ marginBottom: 14 }}>
          <div className="field">
            <label>Email отправителя / Логин</label>
            <input
              value={config.mail_user}
              placeholder="zakaz@newsite.nail-app.ru"
              onChange={(e) =>
                setConfig((p) => ({
                  ...p,
                  mail_user: e.target.value,
                  mail_from: p.mail_from || `Новый сайт <${e.target.value}>`,
                }))
              }
            />
          </div>
          <div className="field">
            <label>
              Пароль от ящика zakaz@newsite.nail-app.ru
              <button
                type="button"
                onClick={() => setShowMailPass(!showMailPass)}
                style={{
                  background: 'none',
                  border: 0,
                  color: 'var(--acc)',
                  cursor: 'pointer',
                  marginLeft: 10,
                  fontSize: 12,
                  fontFamily: 'inherit',
                }}
              >
                {showMailPass ? 'Скрыть' : 'Показать'}
              </button>
            </label>
            <input
              type={showMailPass ? 'text' : 'password'}
              value={config.mail_pass}
              placeholder="Пароль от почтового ящика"
              onChange={(e) => setConfig((p) => ({ ...p, mail_pass: e.target.value }))}
            />
          </div>
          <div className="field">
            <label>Имя и адрес в поле «От кого»</label>
            <input
              value={config.mail_from}
              placeholder="Новый сайт <zakaz@newsite.nail-app.ru>"
              onChange={(e) => setConfig((p) => ({ ...p, mail_from: e.target.value }))}
            />
          </div>
        </div>

        <div
          style={{
            background: 'rgba(37,195,214,0.06)',
            border: '1px solid rgba(37,195,214,0.25)',
            borderRadius: 10,
            padding: '12px 16px',
            fontSize: 13,
            color: 'var(--txt)',
            marginBottom: 20,
            lineHeight: 1.5,
          }}
        >
          💡 <b>Собственная почта newsite.nail-app.ru</b>: порты на хостинге открыты. Письма отправляются с официального адреса <code>zakaz@newsite.nail-app.ru</code> через <code>mail.newsite.nail-app.ru</code> (порт 465 SSL). Все записи SPF и MX уже привязаны к домену в reg.ru.
        </div>

        {/* Recipients list for Mail */}
        <div style={{ marginTop: 22 }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 12,
              flexWrap: 'wrap',
              gap: 10,
            }}
          >
            <h4 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: 'var(--acc)' }}>
              👥 Список почтовых адресов получателей ({config.mail_recipients.length})
            </h4>
            <button
              type="button"
              className="mini-btn"
              onClick={() => addRecipient('mail')}
              style={{ padding: '6px 14px' }}
            >
              + Добавить Email получателя
            </button>
          </div>

          <div
            style={{
              border: '1px solid var(--line)',
              borderRadius: 10,
              background: 'rgba(0,0,0,0.2)',
              overflow: 'hidden',
            }}
          >
            {config.mail_recipients.length === 0 ? (
              <div style={{ padding: 20, textAlign: 'center', color: 'var(--muted)', fontSize: 13.5 }}>
                Список получателей почты пуст. Нажмите «+ Добавить Email получателя», чтобы указать адрес.
              </div>
            ) : (
              config.mail_recipients.map((r, idx) => {
                const badgeKey = `mail:${r.email.trim()}`;
                const res = recipientResults[badgeKey];
                const isTesting = testingRecipientId === badgeKey;

                return (
                  <div
                    key={idx}
                    style={{
                      padding: '12px 14px',
                      borderBottom:
                        idx === config.mail_recipients.length - 1
                          ? 'none'
                          : '1px solid var(--line)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 8,
                    }}
                  >
                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: '1.4fr 1.2fr auto auto auto',
                        gap: 12,
                        alignItems: 'center',
                      }}
                    >
                      <input
                        placeholder="Email (например: nikem79@yandex.ru)"
                        value={r.email}
                        onChange={(e) =>
                          updateRecipient('mail', idx, 'email', e.target.value)
                        }
                        style={{ fontSize: 13.5 }}
                      />
                      <input
                        placeholder="Имя / Должность (например: Николай, Отдел продаж)"
                        value={r.name}
                        onChange={(e) =>
                          updateRecipient('mail', idx, 'name', e.target.value)
                        }
                      />
                      <label
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 6,
                          fontSize: 13,
                          cursor: 'pointer',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={r.enabled}
                          onChange={(e) =>
                            updateRecipient('mail', idx, 'enabled', e.target.checked)
                          }
                          style={{ accentColor: 'var(--acc)' }}
                        />
                        {r.enabled ? 'Вкл' : 'Откл'}
                      </label>
                      <button
                        type="button"
                        className="mini-btn"
                        disabled={isTesting}
                        onClick={() => handleTestRecipient('mail', r)}
                      >
                        {isTesting ? '…' : '🚀 Тест'}
                      </button>
                      <button
                        type="button"
                        className="mini-btn red"
                        onClick={() => removeRecipient('mail', idx)}
                        title="Удалить Email"
                      >
                        ✕
                      </button>
                    </div>

                    {res && (
                      <div
                        style={{
                          fontSize: 12,
                          color: res.ok ? 'var(--green)' : 'var(--red)',
                          paddingLeft: 4,
                        }}
                      >
                        {res.text}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>

          <div
            style={{
              display: 'flex',
              gap: 12,
              alignItems: 'center',
              marginTop: 14,
              flexWrap: 'wrap',
            }}
          >
            <button
              type="button"
              className="btn ghost"
              disabled={testingMailAll || config.mail_recipients.length === 0}
              onClick={() => handleTestAll('mail')}
            >
              {testingMailAll ? 'Отправка…' : '✉️ Отправить тест всем сотрудникам на почту'}
            </button>
            {batchResults.mail && (
              <span
                style={{
                  fontSize: 13.5,
                  fontWeight: 600,
                  color: batchResults.mail.ok ? 'var(--green)' : 'var(--red)',
                }}
              >
                {batchResults.mail.text}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* ========================================================
          CARD 2: TELEGRAM
          ======================================================== */}
      <div className="a-card" style={{ marginBottom: 26 }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 16,
            marginBottom: 16,
            flexWrap: 'wrap',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: 28 }}>✈️</span>
            <div>
              <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800 }}>Telegram (Newsite Bot)</h3>
              <div style={{ color: 'var(--muted)', fontSize: 13, marginTop: 2 }}>
                Оповещения в Telegram-бот и группы
              </div>
            </div>
          </div>
          <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', fontWeight: 700, fontSize: 14 }}>
            <input
              type="checkbox"
              checked={config.telegram_enabled}
              onChange={(e) => setConfig((p) => ({ ...p, telegram_enabled: e.target.checked }))}
              style={{ width: 18, height: 18, accentColor: 'var(--acc)' }}
            />
            {config.telegram_enabled ? (
              <span style={{ color: 'var(--green)' }}>● Оповещения включены</span>
            ) : (
              <span style={{ color: 'var(--muted)' }}>○ Выключены</span>
            )}
          </label>
        </div>

        <div className="frow" style={{ marginBottom: 14 }}>
          <div className="field" style={{ flex: 2 }}>
            <label>
              Токен бота Telegram (от @BotFather)
              <button
                type="button"
                onClick={() => setShowTgToken(!showTgToken)}
                style={{
                  background: 'none',
                  border: 0,
                  color: 'var(--acc)',
                  cursor: 'pointer',
                  marginLeft: 10,
                  fontSize: 12,
                  fontFamily: 'inherit',
                }}
              >
                {showTgToken ? 'Скрыть' : 'Показать'}
              </button>
            </label>
            <input
              type={showTgToken ? 'text' : 'password'}
              value={config.telegram_bot_token}
              placeholder="Если не заполнено — читается из .env.production"
              onChange={(e) => setConfig((p) => ({ ...p, telegram_bot_token: e.target.value }))}
            />
          </div>
          <div className="field" style={{ flex: 1.5 }}>
            <label>Адрес Telegram API / Прокси (зеркало)</label>
            <input
              value={config.telegram_api_url}
              placeholder="https://api.telegram.org"
              onChange={(e) => setConfig((p) => ({ ...p, telegram_api_url: e.target.value }))}
            />
          </div>
        </div>

        <div
          style={{
            background: 'rgba(255,255,255,0.02)',
            border: '1px solid var(--line)',
            borderRadius: 10,
            padding: '10px 14px',
            fontSize: 12.5,
            color: 'var(--muted)',
            marginBottom: 20,
          }}
        >
          💡 <b>О серверах Telegram в РФ</b>: если хостинг не имеет прямого доступа к <code>api.telegram.org</code> (из-за ограничений РКН), сюда можно прописать адрес любого прокси или зеркала без правок в коде проекта.
        </div>

        {/* Recipients list for Telegram */}
        <div style={{ marginTop: 22 }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 12,
              flexWrap: 'wrap',
              gap: 10,
            }}
          >
            <h4 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: 'var(--acc)' }}>
              👥 Список получателей Telegram ({config.telegram_recipients.length})
            </h4>
            <button
              type="button"
              className="mini-btn"
              onClick={() => addRecipient('telegram')}
              style={{ padding: '6px 14px' }}
            >
              + Добавить сотрудника
            </button>
          </div>

          <div
            style={{
              border: '1px solid var(--line)',
              borderRadius: 10,
              background: 'rgba(0,0,0,0.2)',
              overflow: 'hidden',
            }}
          >
            {config.telegram_recipients.length === 0 ? (
              <div style={{ padding: 20, textAlign: 'center', color: 'var(--muted)', fontSize: 13.5 }}>
                Список получателей пуст. Нажмите «+ Добавить сотрудника», чтобы добавить Telegram Chat ID.
              </div>
            ) : (
              config.telegram_recipients.map((r, idx) => {
                const badgeKey = `telegram:${r.id.trim()}`;
                const res = recipientResults[badgeKey];
                const isTesting = testingRecipientId === badgeKey;

                return (
                  <div
                    key={idx}
                    style={{
                      padding: '12px 14px',
                      borderBottom:
                        idx === config.telegram_recipients.length - 1
                          ? 'none'
                          : '1px solid var(--line)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 8,
                    }}
                  >
                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: '160px 1fr auto auto auto',
                        gap: 12,
                        alignItems: 'center',
                      }}
                    >
                      <input
                        placeholder="Chat ID (545061255)"
                        value={r.id}
                        onChange={(e) =>
                          updateRecipient('telegram', idx, 'id', e.target.value)
                        }
                        style={{ fontFamily: 'ui-monospace, monospace', fontSize: 13 }}
                      />
                      <input
                        placeholder="Имя / Должность (например: Николай, Руководитель)"
                        value={r.name}
                        onChange={(e) =>
                          updateRecipient('telegram', idx, 'name', e.target.value)
                        }
                      />
                      <label
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 6,
                          fontSize: 13,
                          cursor: 'pointer',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={r.enabled}
                          onChange={(e) =>
                            updateRecipient('telegram', idx, 'enabled', e.target.checked)
                          }
                          style={{ accentColor: 'var(--acc)' }}
                        />
                        {r.enabled ? 'Вкл' : 'Откл'}
                      </label>
                      <button
                        type="button"
                        className="mini-btn"
                        disabled={isTesting}
                        onClick={() => handleTestRecipient('telegram', r)}
                      >
                        {isTesting ? '…' : '🚀 Тест'}
                      </button>
                      <button
                        type="button"
                        className="mini-btn red"
                        onClick={() => removeRecipient('telegram', idx)}
                        title="Удалить сотрудника"
                      >
                        ✕
                      </button>
                    </div>

                    {res && (
                      <div
                        style={{
                          fontSize: 12,
                          color: res.ok ? 'var(--green)' : 'var(--red)',
                          paddingLeft: 4,
                        }}
                      >
                        {res.text}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>

          <div
            style={{
              display: 'flex',
              gap: 12,
              alignItems: 'center',
              marginTop: 14,
              flexWrap: 'wrap',
            }}
          >
            <button
              type="button"
              className="btn ghost"
              disabled={testingTgAll || config.telegram_recipients.length === 0}
              onClick={() => handleTestAll('telegram')}
            >
              {testingTgAll ? 'Отправка…' : '✈️ Отправить тест всем сотрудникам Telegram'}
            </button>
            {batchResults.telegram && (
              <span
                style={{
                  fontSize: 13.5,
                  fontWeight: 600,
                  color: batchResults.telegram.ok ? 'var(--green)' : 'var(--red)',
                }}
              >
                {batchResults.telegram.text}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* ========================================================
          CARD 3: VKONTAKTE (VK)
          ======================================================== */}
      <div className="a-card" style={{ marginBottom: 26 }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 16,
            marginBottom: 16,
            flexWrap: 'wrap',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: 28 }}>💬</span>
            <div>
              <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800 }}>ВКонтакте (Группа shein63)</h3>
              <div style={{ color: 'var(--muted)', fontSize: 13, marginTop: 2 }}>
                Оповещения в личные сообщения ВКонтакте от имени официального сообщества
              </div>
            </div>
          </div>
          <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', fontWeight: 700, fontSize: 14 }}>
            <input
              type="checkbox"
              checked={config.vk_enabled}
              onChange={(e) => setConfig((p) => ({ ...p, vk_enabled: e.target.checked }))}
              style={{ width: 18, height: 18, accentColor: 'var(--acc)' }}
            />
            {config.vk_enabled ? (
              <span style={{ color: 'var(--green)' }}>● Оповещения включены</span>
            ) : (
              <span style={{ color: 'var(--muted)' }}>○ Выключены</span>
            )}
          </label>
        </div>

        <div className="frow" style={{ marginBottom: 14 }}>
          <div className="field">
            <label>
              Ключ доступа сообщества VK (токен группы)
              <button
                type="button"
                onClick={() => setShowVkToken(!showVkToken)}
                style={{
                  background: 'none',
                  border: 0,
                  color: 'var(--acc)',
                  cursor: 'pointer',
                  marginLeft: 10,
                  fontSize: 12,
                  fontFamily: 'inherit',
                }}
              >
                {showVkToken ? 'Скрыть' : 'Показать'}
              </button>
            </label>
            <input
              type={showVkToken ? 'text' : 'password'}
              value={config.vk_bot_token}
              placeholder="Если не заполнено — читается из .env.production"
              onChange={(e) => setConfig((p) => ({ ...p, vk_bot_token: e.target.value }))}
            />
          </div>
        </div>

        <div
          style={{
            background: 'rgba(37,195,214,0.06)',
            border: '1px solid rgba(37,195,214,0.25)',
            borderRadius: 10,
            padding: '12px 16px',
            fontSize: 13,
            color: 'var(--txt)',
            marginBottom: 20,
            lineHeight: 1.5,
          }}
        >
          ℹ️ <b>Важное правило ВКонтакте</b>: чтобы бот мог присылать сотруднику уведомления, сотрудник должен хотя бы <b>один раз написать любое сообщение</b> (например, «Старт» или «Привет») в личные сообщения сообщества <code>vk.ru/shein63</code>. Иначе ВКонтакте не разрешает сообществу отправку сообщений пользователю.
        </div>

        {/* Recipients list for VK */}
        <div style={{ marginTop: 22 }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 12,
              flexWrap: 'wrap',
              gap: 10,
            }}
          >
            <h4 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: 'var(--acc)' }}>
              👥 Список получателей ВКонтакте ({config.vk_recipients.length})
            </h4>
            <button
              type="button"
              className="mini-btn"
              onClick={() => addRecipient('vk')}
              style={{ padding: '6px 14px' }}
            >
              + Добавить сотрудника
            </button>
          </div>

          <div
            style={{
              border: '1px solid var(--line)',
              borderRadius: 10,
              background: 'rgba(0,0,0,0.2)',
              overflow: 'hidden',
            }}
          >
            {config.vk_recipients.length === 0 ? (
              <div style={{ padding: 20, textAlign: 'center', color: 'var(--muted)', fontSize: 13.5 }}>
                Список получателей пуст. Нажмите «+ Добавить сотрудника», чтобы добавить VK ID.
              </div>
            ) : (
              config.vk_recipients.map((r, idx) => {
                const badgeKey = `vk:${r.id.trim()}`;
                const res = recipientResults[badgeKey];
                const isTesting = testingRecipientId === badgeKey;

                return (
                  <div
                    key={idx}
                    style={{
                      padding: '12px 14px',
                      borderBottom:
                        idx === config.vk_recipients.length - 1
                          ? 'none'
                          : '1px solid var(--line)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 8,
                    }}
                  >
                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: '160px 1fr auto auto auto',
                        gap: 12,
                        alignItems: 'center',
                      }}
                    >
                      <input
                        placeholder="VK ID (6779859)"
                        value={r.id}
                        onChange={(e) =>
                          updateRecipient('vk', idx, 'id', e.target.value)
                        }
                        style={{ fontFamily: 'ui-monospace, monospace', fontSize: 13 }}
                      />
                      <input
                        placeholder="Имя / Должность (например: Николай)"
                        value={r.name}
                        onChange={(e) =>
                          updateRecipient('vk', idx, 'name', e.target.value)
                        }
                      />
                      <label
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 6,
                          fontSize: 13,
                          cursor: 'pointer',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={r.enabled}
                          onChange={(e) =>
                            updateRecipient('vk', idx, 'enabled', e.target.checked)
                          }
                          style={{ accentColor: 'var(--acc)' }}
                        />
                        {r.enabled ? 'Вкл' : 'Откл'}
                      </label>
                      <button
                        type="button"
                        className="mini-btn"
                        disabled={isTesting}
                        onClick={() => handleTestRecipient('vk', r)}
                      >
                        {isTesting ? '…' : '🚀 Тест'}
                      </button>
                      <button
                        type="button"
                        className="mini-btn red"
                        onClick={() => removeRecipient('vk', idx)}
                        title="Удалить сотрудника"
                      >
                        ✕
                      </button>
                    </div>

                    {res && (
                      <div
                        style={{
                          fontSize: 12,
                          color: res.ok ? 'var(--green)' : 'var(--red)',
                          paddingLeft: 4,
                        }}
                      >
                        {res.text}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>

          <div
            style={{
              display: 'flex',
              gap: 12,
              alignItems: 'center',
              marginTop: 14,
              flexWrap: 'wrap',
            }}
          >
            <button
              type="button"
              className="btn ghost"
              disabled={testingVkAll || config.vk_recipients.length === 0}
              onClick={() => handleTestAll('vk')}
            >
              {testingVkAll ? 'Отправка…' : '💬 Отправить тест всем сотрудникам VK'}
            </button>
            {batchResults.vk && (
              <span
                style={{
                  fontSize: 13.5,
                  fontWeight: 600,
                  color: batchResults.vk.ok ? 'var(--green)' : 'var(--red)',
                }}
              >
                {batchResults.vk.text}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Save Bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 16,
          padding: '16px 20px',
          background: 'var(--panel)',
          border: '1px solid var(--line)',
          borderRadius: 12,
          flexWrap: 'wrap',
        }}
      >
        <div style={{ color: 'var(--muted)', fontSize: 13.5 }}>
          Нажмите «Сохранить настройки», чтобы применить все параметры для корпоративной почты, Telegram и ВКонтакте.
        </div>
        <button className="btn primary" onClick={handleSave} disabled={saving}>
          {saving ? 'Сохранение…' : '💾 Сохранить настройки'}
        </button>
      </div>
    </div>
  );
}
