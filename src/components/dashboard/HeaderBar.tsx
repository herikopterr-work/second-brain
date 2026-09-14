'use client';

import Image from 'next/image';
import Link from 'next/link';

interface HeaderBarProps {
  viewMode: 'desktop' | 'mobile';
  onToggleViewMode: (mode: 'desktop' | 'mobile') => void;
  userEmail?: string | null;
}

export default function HeaderBar({
  viewMode,
  onToggleViewMode,
}: HeaderBarProps) {
  return (
    <header className="w-full bg-white/90 backdrop-blur-md border-b border-[#DFE6DC] px-6 py-3.5 sticky top-0 z-40 flex items-center justify-between">
      {/* Left: User Greeting */}
      <div className="flex items-center gap-3">
        <div className="relative w-9 h-9 rounded-full overflow-hidden shrink-0 border border-[#CBD5C8]">
          <Image
            src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=120"
            alt="Lauren Mitchell"
            fill
            className="object-cover"
            unoptimized
          />
        </div>
        <div>
          <div className="flex items-center gap-1 font-bold text-sm text-[#19241C]">
            <span>Lauren Mitchell</span>
            <span className="text-xs text-emerald-600">✓</span>
          </div>
          <div className="text-xs text-[#58655B]">
            Welcome back to Second Brain 👋
          </div>
        </div>
      </div>

      {/* Center: Global Search Bar */}
      <div className="hidden md:flex items-center relative w-80 lg:w-96">
        <span className="absolute left-3.5 text-xs text-[#8A978E]">🔍</span>
        <input
          type="text"
          placeholder="Search items, projects, meetings..."
          className="w-full pl-9 pr-10 py-2 bg-[#F6F8F5] border border-[#DFE6DC] rounded-full text-xs text-[#19241C] placeholder-[#8A978E] focus:outline-none focus:border-[#5B7A66] transition-all shadow-inner"
        />
        <span className="absolute right-3 px-1.5 py-0.5 rounded bg-white border border-[#DFE6DC] text-[9px] font-mono text-[#8A978E]">
          ⌘K
        </span>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3">
        {/* Toggle Mode Desktop vs Mobile Preview */}
        <div className="flex items-center p-1 bg-[#F6F8F5] border border-[#DFE6DC] rounded-xl text-xs font-semibold">
          <button
            onClick={() => onToggleViewMode('desktop')}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
              viewMode === 'desktop'
                ? 'bg-[#162B20] text-white shadow-sm'
                : 'text-[#58655B] hover:text-[#19241C]'
            }`}
          >
            <span>🖥️</span>
            <span className="hidden sm:inline">Desktop</span>
          </button>
          <button
            onClick={() => onToggleViewMode('mobile')}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
              viewMode === 'mobile'
                ? 'bg-[#162B20] text-white shadow-sm'
                : 'text-[#58655B] hover:text-[#19241C]'
            }`}
          >
            <span>📱</span>
            <span className="hidden sm:inline">Mobile PWA</span>
          </button>
        </div>

        {/* Notifications */}
        <button
          className="w-9 h-9 rounded-full bg-[#F6F8F5] border border-[#DFE6DC] hover:border-[#CBD5C8] flex items-center justify-center text-sm text-[#58655B] transition-colors relative"
          title="Notifikasi"
        >
          <span>🔔</span>
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#DC2626]" />
        </button>

        {/* Primary CTA + Capture */}
        <Link
          href="/capture"
          className="px-4 py-2 rounded-xl bg-[#072517] hover:bg-[#162B20] text-white font-bold text-xs transition-all shadow-md flex items-center gap-1.5 active:scale-95"
        >
          <span>+</span>
          <span>Capture</span>
        </Link>
      </div>
    </header>
  );
}
