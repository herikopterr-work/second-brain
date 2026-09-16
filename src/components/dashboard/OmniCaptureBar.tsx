'use client';

import { useState } from 'react';
import { savePendingItem, type PendingItem } from '@/lib/offline/db';
import { syncPendingItems, notifySyncUpdate } from '@/lib/offline/sync';

export default function OmniCaptureBar() {
  const [text, setText] = useState('');
  const [feedbackPlaceholder, setFeedbackPlaceholder] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed || saving) return;

    setSaving(true);
    const itemId = crypto.randomUUID();
    const nowIso = new Date().toISOString();

    const newItem: PendingItem = {
      id: itemId,
      title: trimmed,
      body: null,
      type: 'inbox',
      status: 'open',
      created_at: nowIso,
      sync_status: 'pending',
    };

    try {
      await savePendingItem(newItem);
      const savedText = trimmed;
      setText('');
      setFeedbackPlaceholder(`Tersimpan ke Inbox: "${savedText.slice(0, 24)}..."`);
      notifySyncUpdate();

      setTimeout(() => {
        setFeedbackPlaceholder(null);
      }, 2500);

      if (navigator.onLine) {
        syncPendingItems();
      }
    } catch (err) {
      console.error('Gagal menyimpan capture:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="bg-capture-banner rounded-2xl px-unit-lg py-unit-sm shadow-sm transition-all flex items-center gap-unit-md focus-within:ring-2 focus-within:ring-capture-accent/30 border border-[#EADBCE]">
      <div className="w-8 h-8 rounded-xl bg-tertiary-fixed text-tertiary flex items-center justify-center shrink-0 shadow-xs">
        <span className="material-symbols-outlined text-lg text-capture-accent">bolt</span>
      </div>

      <input
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            handleSubmit();
          }
        }}
        placeholder={
          feedbackPlaceholder ||
          'Ketik apa saja yang terlintas di kepala lalu tekan Enter untuk simpan ke Inbox...'
        }
        className="flex-1 bg-transparent text-[13.5px] text-tertiary placeholder:text-text-muted focus:outline-none"
      />

      <div className="flex items-center gap-unit-sm shrink-0">
        <span className="text-[11px] font-semibold text-text-muted hidden sm:inline-flex items-center gap-0.5 bg-surface-elevated/70 px-unit-xs py-1 rounded-md shadow-xs border border-border-subtle/40">
          <span className="text-xs">↵</span> Enter
        </span>
        <button
          type="button"
          onClick={() => handleSubmit()}
          disabled={!text.trim() || saving}
          aria-label="Capture item"
          className="w-8 h-8 rounded-xl bg-tertiary-container hover:bg-primary-container text-white flex items-center justify-center shadow-sm transition-transform active:scale-95 disabled:opacity-40"
        >
          <span className="material-symbols-outlined text-sm font-bold">arrow_forward</span>
        </button>
      </div>
    </section>
  );
}
