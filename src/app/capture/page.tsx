'use client';

import { useState, useEffect, useRef } from 'react';
import AppShell from '@/components/layout/AppShell';
import { savePendingItem, getPendingItems, type PendingItem } from '@/lib/offline/db';
import { syncPendingItems, notifySyncUpdate, SYNC_EVENT_NAME } from '@/lib/offline/sync';

export default function CapturePage() {
  const [text, setText] = useState('');
  const [savedToast, setSavedToast] = useState(false);
  const [recentItems, setRecentItems] = useState<PendingItem[]>([]);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const loadRecentItems = async () => {
    try {
      const items = await getPendingItems();
      setRecentItems(items.slice(-5).reverse());
    } catch {
      // Abaikan jika indexeddb belum siap
    }
  };

  useEffect(() => {
    inputRef.current?.focus();
    loadRecentItems();

    const handleSyncUpdate = () => {
      loadRecentItems();
    };

    window.addEventListener(SYNC_EVENT_NAME, handleSyncUpdate);
    return () => {
      window.removeEventListener(SYNC_EVENT_NAME, handleSyncUpdate);
    };
  }, []);

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    const trimmed = text.trim();
    if (!trimmed) return;

    // 1. Generate UUID di sisi klien untuk mencegah duplikasi (idempotent)
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

    // 2. Simpan seketika ke IndexedDB lokal (tanpa menunggu jaringan)
    await savePendingItem(newItem);

    // 3. Reset input & beri konfirmasi visual instan (<50ms)
    setText('');
    setSavedToast(true);
    notifySyncUpdate();
    loadRecentItems();

    // Auto-focus kembali ke input untuk capture berikutnya
    inputRef.current?.focus();

    // Sembunyikan toast setelah 2 detik
    setTimeout(() => {
      setSavedToast(false);
    }, 2000);

    // 4. Trigger sinkronisasi di latar belakang jika online
    if (navigator.onLine) {
      syncPendingItems();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Tekan Enter (tanpa Shift) atau Cmd/Ctrl + Enter untuk simpan cepat
    if ((e.key === 'Enter' && !e.shiftKey) || (e.key === 'Enter' && (e.metaKey || e.ctrlKey))) {
      e.preventDefault();
      handleSave();
    }
  };

  return (
    <AppShell maxContentWidth="max-w-xl">
      <div className="flex flex-col justify-start space-y-6">
        <div className="space-y-1">
          <h1 className="text-xl font-bold tracking-tight text-[#19241C]">Quick Capture</h1>
          <p className="text-xs text-[#5B6B60]">
            Tulis ide, tugas, atau pertanyaan. Disimpan instan ke antrean Inbox lokal bahkan saat offline.
          </p>
        </div>

        {/* Form Capture Sederhana */}
        <div className="bg-white border border-[#DFE6DC] rounded-3xl p-5 sm:p-6 shadow-sm space-y-4">
          <form onSubmit={handleSave} className="space-y-3">
            <div className="relative">
              <textarea
                ref={inputRef}
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ketik apa pun di sini... (tekan Enter untuk simpan)"
                rows={4}
                className="w-full px-4 py-3.5 bg-[#EFF3ED] border border-[#DFE6DC] rounded-2xl text-[#19241C] placeholder-[#9CA3AF] focus:outline-none focus:border-[#162B20] focus:ring-1 focus:ring-[#162B20] transition-all text-sm resize-none"
              />

              {/* Flash Toast Konfirmasi */}
              {savedToast && (
                <div className="absolute top-3 right-3 flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EBF4EE] border border-[#CBE0D1] text-[#1E3B2B] text-xs font-bold shadow-md animate-fade-in">
                  <span>✓</span>
                  <span>Tersimpan di Inbox!</span>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={!text.trim()}
              className="w-full py-3.5 px-6 rounded-2xl bg-[#162B20] hover:bg-[#1E3B2B] text-white font-bold text-sm transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed shadow-sm flex items-center justify-center gap-2 active:scale-[0.99]"
            >
              <span>⚡ Simpan ke Inbox</span>
            </button>
          </form>
        </div>

        {/* Daftar Tangkapan Baru / Pending Items */}
        {recentItems.length > 0 && (
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between text-xs text-[#5B6B60] font-semibold">
              <span>Item di Antrean Lokal (IndexedDB)</span>
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-white border border-[#DFE6DC] text-[#19241C]">
                {recentItems.length} item
              </span>
            </div>

            <div className="space-y-2">
              {recentItems.map((item) => (
                <div
                  key={item.id}
                  className="p-3.5 bg-white border border-[#DFE6DC] rounded-2xl flex items-center justify-between text-xs shadow-sm"
                >
                  <p className="text-[#19241C] font-medium truncate pr-3">{item.title}</p>
                  <span className="shrink-0 px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#FEF3C7] text-[#92400E] border border-[#FDE68A]">
                    Pending
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
