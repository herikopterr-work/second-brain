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
    <header className="sticky top-0 z-50 w-full bg-[#EFF3ED]/90 backdrop-blur-md border-b border-[#DFE6DC] px-4 py-3">
      <div className="max-w-5xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2 group">
            <span className="text-xl group-hover:scale-110 transition-transform">🧠</span>
            <span className="font-bold text-sm tracking-tight text-[#19241C] group-hover:text-[#162B20] transition-colors">
              Second Brain
            </span>
          </Link>

          <nav className="flex items-center gap-1 text-xs overflow-x-auto py-0.5">
            <Link
              href="/capture"
              className={`px-2.5 py-1.5 rounded-xl font-semibold transition-all shrink-0 ${
                pathname === '/capture'
                  ? 'bg-[#162B20] text-white shadow-sm'
                  : 'text-[#5B6B60] hover:text-[#19241C] hover:bg-white/70'
              }`}
            >
              ⚡ Capture
            </Link>
            <Link
              href="/inbox"
              className={`px-2.5 py-1.5 rounded-xl font-semibold transition-all shrink-0 ${
                pathname === '/inbox'
                  ? 'bg-[#162B20] text-white shadow-sm'
                  : 'text-[#5B6B60] hover:text-[#19241C] hover:bg-white/70'
              }`}
            >
              📥 Inbox
            </Link>
            <Link
              href="/items"
              className={`px-2.5 py-1.5 rounded-xl font-semibold transition-all shrink-0 ${
                pathname === '/items'
                  ? 'bg-[#162B20] text-white shadow-sm'
                  : 'text-[#5B6B60] hover:text-[#19241C] hover:bg-white/70'
              }`}
            >
              📋 Open Items
            </Link>
            <Link
              href="/areas"
              className={`px-2.5 py-1.5 rounded-xl font-semibold transition-all shrink-0 ${
                pathname === '/areas'
                  ? 'bg-[#162B20] text-white shadow-sm'
                  : 'text-[#5B6B60] hover:text-[#19241C] hover:bg-white/70'
              }`}
            >
              📁 Areas
            </Link>
            <Link
              href="/projects"
              className={`px-2.5 py-1.5 rounded-xl font-semibold transition-all shrink-0 ${
                pathname === '/projects'
                  ? 'bg-[#162B20] text-white shadow-sm'
                  : 'text-[#5B6B60] hover:text-[#19241C] hover:bg-white/70'
              }`}
            >
              🎯 Projects
            </Link>
            <Link
              href="/people"
              className={`px-2.5 py-1.5 rounded-xl font-semibold transition-all shrink-0 ${
                pathname === '/people'
                  ? 'bg-[#162B20] text-white shadow-sm'
                  : 'text-[#5B6B60] hover:text-[#19241C] hover:bg-white/70'
              }`}
            >
              👤 People
            </Link>
            <Link
              href="/"
              className={`px-2.5 py-1.5 rounded-xl font-semibold transition-all shrink-0 ${
                pathname === '/'
                  ? 'bg-white text-[#19241C] border border-[#DFE6DC] shadow-sm'
                  : 'text-[#5B6B60] hover:text-[#19241C] hover:bg-white/70'
              }`}
            >
              🏠 Beranda
            </Link>
          </nav>
        </div>

        {/* Sync & Connectivity Badges */}
        <div className="flex items-center gap-2.5">
          {/* Status Online/Offline */}
          <div
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${
              isOnline
                ? 'bg-[#EBF4EE] border-[#CBE0D1] text-[#1E3B2B]'
                : 'bg-[#FEF3C7] border-[#FDE68A] text-[#92400E]'
            }`}
          >
            <span
              className={`h-1.5 w-1.5 rounded-full ${
                isOnline ? 'bg-[#1E3B2B]' : 'bg-[#92400E] animate-pulse'
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
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-[#FEF3C7] border border-[#FDE68A] text-[#92400E] hover:bg-[#FDE68A] transition-all cursor-pointer disabled:cursor-default shadow-sm"
            >
              <span className={syncing ? 'animate-spin' : ''}>🔄</span>
              <span>{syncing ? 'Menyinkronkan...' : `${pendingCount} Pending`}</span>
            </button>
          ) : (
            <div className="hidden sm:flex items-center gap-1 px-2 py-1 text-[11px] text-[#5B6B60] font-medium">
              <span className="text-[#162B20] font-bold">✓</span>
              <span>Tersinkron</span>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
