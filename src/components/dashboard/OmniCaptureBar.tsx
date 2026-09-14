'use client';

import { useState } from 'react';
import { savePendingItem, type PendingItem } from '@/lib/offline/db';
import { syncPendingItems, notifySyncUpdate } from '@/lib/offline/sync';

export default function OmniCaptureBar() {
  const [text, setText] = useState('');
  const [toast, setToast] = useState(false);
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
      setText('');
      setToast(true);
      notifySyncUpdate();

      setTimeout(() => {
        setToast(false);
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
    <div className="relative">
      <form
        onSubmit={handleSubmit}
        className="w-full bg-[#FDF6EA] border border-[#EADBCE] rounded-2xl p-2.5 px-4 flex items-center gap-3 shadow-sm hover:border-[#C27803]/40 transition-all"
      >
        {/* Left Lightning Icon */}
        <div className="w-8 h-8 rounded-xl bg-[#FEF3C7] text-[#C27803] flex items-center justify-center font-bold text-base shrink-0 shadow-inner">
          ⚡
        </div>

        {/* Input Field */}
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Ketik apa saja yang terlintas di kepala lalu tekan Enter untuk simpan ke Inbox..."
          className="flex-1 bg-transparent text-xs sm:text-sm text-[#19241C] placeholder-[#8A978E] focus:outline-none font-medium"
        />

        {/* Right Prompt & Button */}
        <div className="flex items-center gap-2 shrink-0">
          <span className="hidden sm:inline text-[10px] font-mono text-[#8A978E] bg-[#F6EEDF] px-2 py-0.5 rounded border border-[#EADBCE]">
            ⏎ Enter
          </span>
          <button
            type="submit"
            disabled={!text.trim()}
            className="w-8 h-8 rounded-xl bg-[#351800] hover:bg-[#542a00] text-white flex items-center justify-center text-xs transition-all disabled:opacity-30 active:scale-95 shadow-md"
            title="Simpan ke Inbox"
          >
            ➔
          </button>
        </div>
      </form>

      {/* Floating Micro-Toast Feedback */}
      {toast && (
        <div className="absolute -bottom-8 left-4 flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#1E3B2B] text-white text-[11px] font-semibold shadow-lg animate-fade-in z-20">
          <span>✓</span>
          <span>Tersimpan di Inbox</span>
        </div>
      )}
    </div>
  );
}
