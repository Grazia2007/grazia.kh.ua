'use client';

import React, { useState } from 'react';
import { ArrowRight, CheckCircle2, Loader2 } from 'lucide-react';

// заявка "Хочу так само" зі сторінки проєкту: менеджер отримує в telegram обкладинку і назву роботи
export default function SameAsProjectLead({
  projectId, projectTitle, projectLocation, coverUrl, projectPath
}: {
  projectId?: string | number;
  projectTitle?: string;
  projectLocation?: string;
  coverUrl?: string;
  projectPath?: string;
}) {
  const [phone, setPhone] = useState('');
  const [state, setState] = useState<'idle' | 'sending' | 'done' | 'error'>('idle');
  const [error, setError] = useState('');

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const digits = phone.replace(/\D/g, '');
    if (digits.length < 9 || digits.length > 13) {
      setState('error');
      setError('Вкажіть номер телефону повністю');
      return;
    }
    setState('sending');
    setError('');
    try {
      const res = await fetch('/api/telegram', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ source: 'project', projectId, projectTitle, projectLocation, coverUrl, projectPath, phone })
      });
      if (!res.ok) throw new Error();
      (window as unknown as { gtag?: (...a: unknown[]) => void }).gtag?.('event', 'generate_lead', { form: 'same_as_project' });
      setState('done');
    } catch {
      setState('error');
      setError('Не вдалося надіслати. Спробуйте ще раз або зателефонуйте нам.');
    }
  };

  if (state === 'done') {
    return (
      <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-sm p-8 flex items-start gap-4">
        <CheckCircle2 size={24} className="text-[var(--accent-main)] shrink-0 mt-1" />
        <div>
          <h4 className="text-xl font-serif text-[var(--text-main)] mb-2">Заявку отримано</h4>
          <p className="text-sm text-[var(--text-muted)] font-light leading-relaxed">Ми зателефонуємо, щоб обговорити розміри й матеріали для вашого приміщення.</p>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-sm p-8">
      <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-[var(--accent-main)] font-bold block mb-3">Сподобалось?</span>
      <h4 className="text-2xl font-serif text-[var(--text-main)] mb-3">Хочу так само</h4>
      <p className="text-sm text-[var(--text-muted)] font-light leading-relaxed mb-6">
        Залиште номер — зробимо під ваші розміри, з тими ж матеріалами або підберемо інші.
      </p>
      <div className="flex flex-col sm:flex-row gap-3">
        <input
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          value={phone}
          onChange={e => { setPhone(e.target.value); if (state === 'error') setState('idle'); }}
          placeholder="+380 __ ___ __ __"
          aria-label="Номер телефону"
          className="flex-1 min-w-0 bg-[var(--bg-main)] border border-[var(--border-color)] rounded-sm px-4 py-4 text-sm text-[var(--text-main)] outline-none focus:border-[var(--accent-main)] transition-colors"
        />
        <button
          type="submit"
          disabled={state === 'sending'}
          className="bg-[var(--btn-bg)] text-[var(--btn-text)] px-6 py-4 text-xs font-semibold uppercase tracking-widest flex items-center justify-center gap-2 rounded-sm hover:opacity-85 transition-opacity disabled:opacity-60"
        >
          {state === 'sending' ? <Loader2 size={16} className="animate-spin" /> : <ArrowRight size={16} />}
          Надіслати
        </button>
      </div>
      {state === 'error' && <p role="alert" className="text-xs text-red-600 mt-3">{error}</p>}
    </form>
  );
}
