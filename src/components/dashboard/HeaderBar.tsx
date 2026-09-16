'use client';

import Link from 'next/link';

interface HeaderBarProps {
  viewMode?: 'desktop' | 'mobile';
  onToggleViewMode?: (mode: 'desktop' | 'mobile') => void;
  userEmail?: string | null;
  onOpenMobileMenu?: () => void;
}

export default function HeaderBar({
  viewMode = 'desktop',
  onToggleViewMode,
  userEmail,
  onOpenMobileMenu,
}: HeaderBarProps) {
  const userName = userEmail
    ? userEmail.split('@')[0].replace('.', ' ').replace(/\b\w/g, (l) => l.toUpperCase())
    : 'Lauren Mitchell';

  const userInitials = userName.slice(0, 2).toUpperCase();

  return (
    <header className="bg-surface-card rounded-2xl border border-border-subtle shadow-sm flex items-center justify-between px-unit-xl py-unit-md gap-unit-md w-full">
      {/* User Greeting & Mobile Hamburger */}
      <div className="flex items-center gap-unit-md min-w-0">
        {onOpenMobileMenu && (
          <button
            type="button"
            onClick={onOpenMobileMenu}
            className="lg:hidden p-1.5 rounded-xl bg-surface-container-low text-text-primary hover:bg-surface-container transition-colors flex items-center justify-center"
            title="Buka Menu"
          >
            <span className="material-symbols-outlined text-xl">menu</span>
          </button>
        )}

        <div className="w-9 h-9 rounded-full bg-sage-medium text-white flex items-center justify-center font-bold text-xs ring-1 ring-border-strong shrink-0 shadow-xs">
          {userInitials}
        </div>

        <div className="flex flex-col min-w-0 leading-tight">
          <div className="flex items-center gap-1.5">
            <span className="text-[14px] text-forest-dark font-semibold truncate">{userName}</span>
            <span className="material-symbols-outlined text-sm text-type-action">check_circle</span>
          </div>
          <span className="text-[12px] text-text-secondary truncate">
            Welcome back to Second Brain 👋
          </span>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-unit-md shrink-0">
        {/* Global Search Bar */}
        <div className="relative items-center hidden md:flex">
          <span className="material-symbols-outlined absolute left-unit-md text-text-muted text-lg pointer-events-none">
            search
          </span>
          <input
            className="w-64 bg-surface-container-low pl-9 pr-12 py-unit-xs rounded-xl text-[12px] text-text-primary placeholder:text-text-muted focus:outline-none focus:bg-surface-elevated shadow-[0_1px_4px_rgba(0,0,0,0.02)] transition-all"
            placeholder="Search..."
            type="text"
            readOnly
          />
          <span className="absolute right-unit-sm text-[11px] font-semibold text-text-muted bg-surface-variant px-unit-xs py-0.5 rounded">
            ⌘K
          </span>
        </div>

        {/* View Mode Toggle (Desktop vs Mobile Preview) */}
        {onToggleViewMode && (
          <div className="hidden sm:flex items-center p-0.5 bg-surface-container-low border border-border-subtle rounded-xl text-xs font-semibold">
            <button
              type="button"
              onClick={() => onToggleViewMode('desktop')}
              className={`px-2.5 py-1 rounded-lg transition-all text-[11px] ${
                viewMode === 'desktop'
                  ? 'bg-primary-container text-white shadow-xs'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              Desktop
            </button>
            <button
              type="button"
              onClick={() => onToggleViewMode('mobile')}
              className={`px-2.5 py-1 rounded-lg transition-all text-[11px] ${
                viewMode === 'mobile'
                  ? 'bg-primary-container text-white shadow-xs'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              Mobile
            </button>
          </div>
        )}

        {/* Notifications */}
        <button
          aria-label="Notifications"
          className="relative w-9 h-9 flex items-center justify-center rounded-xl text-text-secondary hover:bg-surface-container-low hover:text-text-primary transition-all"
          type="button"
        >
          <span className="material-symbols-outlined text-xl">notifications</span>
          <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-status-critical ring-2 ring-surface-card"></span>
        </button>

        {/* + Capture Action Button */}
        <Link
          href="/capture"
          className="flex items-center gap-unit-xs bg-primary hover:bg-primary-container text-on-primary px-unit-lg py-unit-xs rounded-xl text-[14px] font-semibold shadow-[0_2px_8px_rgba(7,37,23,0.16)] transition-all active:scale-95"
        >
          <span className="material-symbols-outlined text-base">add</span>
          <span>+ Capture</span>
        </Link>
      </div>
    </header>
  );
}
