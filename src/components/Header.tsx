'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { getPendingCount } from '@/lib/offline/db';
import { syncPendingItems, isCurrentlySyncing, SYNC_EVENT_NAME } from '@/lib/offline/sync';

export default function Header() {
  const pathname = usePathname();
  const [isOnline, setIsOnline] = useState(true);
  const [pendingCount, setPendingCount] = useState(0);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    setIsOnline(navigator.onLine);

    const updateState = async () => {
      try {
        const count = await getPendingCount();
        setPendingCount(count);
        setSyncing(isCurrentlySyncing());
      } catch {
        // Abaikan jika indexeddb belum siap
      }
    };

    updateState();

    const handleOnline = () => {
      setIsOnline(true);
      syncPendingItems();
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    window.addEventListener(SYNC_EVENT_NAME, updateState);

    // Polling periodik ringan untuk memastikan counter selalu akurat
    const interval = setInterval(updateState, 3000);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener(SYNC_EVENT_NAME, updateState);
      clearInterval(interval);
    };
  }, []);

  const handleManualSync = async () => {
    if (!isOnline || syncing) return;
    await syncPendingItems();
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-neutral-950/80 backdrop-blur-md border-b border-neutral-800/80 px-4 py-3">
      <div className="max-w-4xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2 group">
            <span className="text-xl group-hover:scale-110 transition-transform">🧠</span>
            <span className="font-bold text-sm tracking-tight text-neutral-100 group-hover:text-emerald-400 transition-colors">
              Second Brain
            </span>
          </Link>

          <nav className="flex items-center gap-1 text-xs">
            <Link
              href="/capture"
              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                pathname === '/capture'
                  ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                  : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900'
              }`}
            >
              ⚡ Capture
            </Link>
            <Link
              href="/"
              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                pathname === '/'
                  ? 'bg-neutral-800 text-neutral-100'
                  : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900'
              }`}
            >
              Beranda
            </Link>
          </nav>
        </div>

        {/* Sync & Connectivity Badges */}
        <div className="flex items-center gap-2.5">
          {/* Status Online/Offline */}
          <div
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium border ${
              isOnline
                ? 'bg-emerald-950/40 border-emerald-800/50 text-emerald-400'
                : 'bg-amber-950/40 border-amber-800/50 text-amber-400'
            }`}
          >
            <span
              className={`h-1.5 w-1.5 rounded-full ${
                isOnline ? 'bg-emerald-400' : 'bg-amber-400 animate-pulse'
              }`}
            />
            <span>{isOnline ? 'Online' : 'Offline'}</span>
          </div>

          {/* Pending Sync Counter */}
          {pendingCount > 0 ? (
            <button
              onClick={handleManualSync}
              disabled={!isOnline || syncing}
              title={isOnline ? 'Klik untuk sinkronkan sekarang' : 'Akan disinkronkan saat online'}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-amber-500/15 border border-amber-500/30 text-amber-300 hover:bg-amber-500/25 transition-all cursor-pointer disabled:cursor-default"
            >
              <span className={syncing ? 'animate-spin' : ''}>🔄</span>
              <span>{syncing ? 'Menyinkronkan...' : `${pendingCount} Pending`}</span>
            </button>
          ) : (
            <div className="hidden sm:flex items-center gap-1 px-2 py-1 text-[11px] text-neutral-500 font-medium">
              <span className="text-emerald-500">✓</span>
              <span>Tersinkron</span>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
