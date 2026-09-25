'use client';
import { useState } from 'react';
import { L, useLang } from './L';

export default function ContactForm() {
  const { lang } = useLang();
  const [f, setF] = useState({ name: '', phone: '', email: '', company: '', comment: '' });
  const [sending, setSending] = useState(false);
  const [ok, setOk] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setF((p) => ({ ...p, [k]: e.target.value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    if (!f.name.trim() || !f.phone.trim()) {
      setErr(lang === 'ru' ? 'Укажите имя и телефон' : 'Please provide name and phone');
      return;
    }
    setSending(true);
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: f.name.trim(),
          phone: f.phone.trim(),
          email: f.email.trim() || null,
          company: f.company.trim() || null,
          address: null,
          comment: f.comment.trim() || null,
          payment: null,
          items: [],
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'error');
      setOk(data.number);
      setF({ name: '', phone: '', email: '', company: '', comment: '' });
    } catch (ex) {
      setErr(ex instanceof Error ? ex.message : String(ex));
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      <h3 style={{ marginBottom: 18 }}>
        <L ru="Оставить заявку" en="Send a request" />
      </h3>
      <form onSubmit={submit}>
        <div className="frow">
          <div className="field">
            <label><L ru="Имя" en="Name" /> <span className="req">*</span></label>
            <input value={f.name} onChange={set('name')} placeholder={lang === 'ru' ? 'Иван Петров' : 'John Smith'} />
          </div>
          <div className="field">
            <label><L ru="Телефон" en="Phone" /> <span className="req">*</span></label>
            <input value={f.phone} onChange={set('phone')} placeholder="+7 (___) ___-__-__" />
          </div>
        </div>
        <div className="frow">
          <div className="field">
            <label>E-mail</label>
            <input type="email" value={f.email} onChange={set('email')} placeholder="you@company.ru" />
          </div>
          <div className="field">
            <label><L ru="Компания" en="Company" /></label>
            <input value={f.company} onChange={set('company')} placeholder={lang === 'ru' ? 'ООО «СтройЭнерго»' : 'Your company'} />
          </div>
        </div>
        <div className="field">
          <label><L ru="Сообщение" en="Message" /></label>
          <textarea value={f.comment} onChange={set('comment')} rows={4} placeholder={lang === 'ru' ? 'Опишите задачу: оборудование, параметры, сроки…' : 'Describe your task: equipment, specs, deadlines…'} />
        </div>
        <div className="form-actions">
          <button className="btn primary" disabled={sending}>
            {sending ? '…' : <><L ru="Отправить заявку" en="Send request" /></>}
          </button>
          {ok && (
            <span className="ord-ok" style={{ marginTop: 0 }}>
              <L ru="Заявка" en="Request" /> <b>{ok}</b>{' '}
              <L ru="принята — мы свяжемся с вами." en="received — we will contact you." />
            </span>
          )}
        </div>
        {err && <div className="alert err">{err}</div>}
      </form>
    </>
  );
}
