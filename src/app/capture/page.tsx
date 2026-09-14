'use client';

import { useState, useEffect, useRef } from 'react';
import Header from '@/components/Header';
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
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col">
      <Header />

      <main className="flex-1 max-w-xl w-full mx-auto p-4 sm:p-6 flex flex-col justify-start space-y-6">
        <div className="space-y-1">
          <h1 className="text-xl font-bold tracking-tight">Quick Capture</h1>
          <p className="text-xs text-neutral-400">
            Tulis ide, tugas, atau pertanyaan. Disimpan instan ke Inbox bahkan saat offline.
          </p>
        </div>

        {/* Form Capture Sederhana */}
        <form onSubmit={handleSave} className="space-y-3">
          <div className="relative">
            <textarea
              ref={inputRef}
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ketik apa pun di sini... (tekan Enter untuk simpan)"
              rows={4}
              className="w-full px-4 py-3.5 bg-neutral-900 border border-neutral-800 rounded-2xl text-neutral-100 placeholder-neutral-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all text-sm resize-none shadow-inner"
            />

            {/* Flash Toast Konfirmasi */}
            {savedToast && (
              <div className="absolute top-3 right-3 flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500 text-neutral-950 text-xs font-semibold shadow-lg animate-fade-in">
                <span>✓</span>
                <span>Tersimpan di Inbox!</span>
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={!text.trim()}
            className="w-full py-3.5 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-emerald-950 flex items-center justify-center gap-2 active:scale-[0.99]"
          >
            <span>⚡ Simpan ke Inbox</span>
          </button>
        </form>

        {/* Daftar Tangkapan Baru / Pending Items */}
        {recentItems.length > 0 && (
          <div className="space-y-3 pt-4 border-t border-neutral-800/80">
            <div className="flex items-center justify-between text-xs text-neutral-400 font-medium">
              <span>Item di Antrean Lokal (IndexedDB)</span>
              <span className="text-[11px] text-neutral-500">{recentItems.length} item</span>
            </div>

            <div className="space-y-2">
              {recentItems.map((item) => (
                <div
                  key={item.id}
                  className="p-3 bg-neutral-900/70 border border-neutral-800/80 rounded-xl flex items-center justify-between text-xs"
                >
                  <p className="text-neutral-200 truncate pr-3">{item.title}</p>
                  <span className="shrink-0 px-2 py-0.5 rounded-full text-[10px] font-medium bg-amber-500/10 text-amber-300 border border-amber-500/20">
                    Pending
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
