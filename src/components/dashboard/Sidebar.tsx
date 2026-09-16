'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { X } from 'lucide-react';

interface SidebarProps {
  userEmail?: string | null;
  inboxCount?: number;
  onClose?: () => void;
}

export default function Sidebar({ userEmail, inboxCount = 0, onClose }: SidebarProps) {
  const pathname = usePathname();

  const handleLinkClick = () => {
    if (onClose) onClose();
  };

  const userName = userEmail
    ? userEmail.split('@')[0].replace('.', ' ').replace(/\b\w/g, (l) => l.toUpperCase())
    : 'Lauren Mitchell';

  const displayEmail = userEmail || 'lauren@gmail.com';

  return (
    <aside className="w-64 bg-surface-card rounded-2xl border border-border-subtle shadow-sm z-50 flex flex-col justify-between overflow-hidden shrink-0 h-full select-none">
      <div className="p-unit-lg flex-1 flex flex-col gap-unit-lg overflow-y-auto min-h-0">
        {/* Workspace Switcher */}
        <div className="flex items-center justify-between px-unit-xs py-unit-2xs">
          <div className="flex items-center gap-unit-md min-w-0">
            <div className="w-8 h-8 rounded-xl bg-primary-container text-white flex items-center justify-center font-bold text-sm shadow-xs shrink-0">
              <span className="material-symbols-outlined text-lg text-secondary-container">psychology</span>
            </div>
            <div className="min-w-0">
              <div className="text-[14px] font-semibold text-forest-dark truncate leading-tight">Second Brain</div>
              <div className="text-[10.5px] font-bold text-text-muted tracking-wider uppercase truncate">GTD • PARA Hub</div>
            </div>
          </div>
          {onClose ? (
            <button
              onClick={onClose}
              className="p-unit-2xs text-text-muted hover:text-text-primary transition-colors flex items-center justify-center"
              title="Tutup Menu"
            >
              <X className="w-4 h-4" />
            </button>
          ) : (
            <button
              aria-label="Workspace switcher"
              className="p-unit-2xs text-text-muted hover:text-text-primary transition-colors flex items-center justify-center"
              type="button"
            >
              <span className="material-symbols-outlined text-lg">unfold_more</span>
            </button>
          )}
        </div>

        {/* Quick Search */}
        <div className="relative flex items-center">
          <span className="material-symbols-outlined absolute left-unit-md text-text-muted text-lg pointer-events-none">
            search
          </span>
          <input
            className="w-full bg-surface-container pl-9 pr-12 py-unit-xs rounded-xl text-[12px] text-text-primary placeholder:text-text-muted focus:outline-none focus:bg-surface-elevated shadow-[0_1px_4px_rgba(0,0,0,0.02)] transition-all"
            placeholder="Quick search..."
            type="text"
            readOnly
          />
          <span className="absolute right-unit-sm text-[11px] font-semibold text-text-muted bg-surface-variant px-unit-xs py-0.5 rounded">
            ⌘F
          </span>
        </div>

        {/* Navigation Group: Main */}
        <div className="flex flex-col gap-unit-md">
          <div className="px-unit-xs text-[10.5px] font-bold text-text-muted uppercase tracking-wider">
            Main
          </div>
          <nav className="flex flex-col gap-unit-2xs">
            <Link
              href="/"
              onClick={handleLinkClick}
              className={`flex items-center justify-between px-unit-md py-unit-xs rounded-xl transition-all ${
                pathname === '/'
                  ? 'bg-primary text-on-primary font-semibold shadow-[0_2px_8px_rgba(7,37,23,0.12)]'
                  : 'text-text-secondary hover:bg-surface-container-high hover:text-text-primary'
              }`}
            >
              <div className="flex items-center gap-unit-md">
                <span className="material-symbols-outlined text-xl">dashboard</span>
                <span className="text-[13.5px]">Dashboard</span>
              </div>
              <span className={`material-symbols-outlined text-sm ${pathname === '/' ? 'opacity-80' : 'opacity-40'}`}>
                chevron_right
              </span>
            </Link>

            <Link
              href="/items"
              onClick={handleLinkClick}
              className={`flex items-center justify-between px-unit-md py-unit-xs rounded-xl transition-all ${
                pathname === '/items'
                  ? 'bg-primary text-on-primary font-semibold shadow-[0_2px_8px_rgba(7,37,23,0.12)]'
                  : 'text-text-secondary hover:bg-surface-container-high hover:text-text-primary'
              }`}
            >
              <div className="flex items-center gap-unit-sm min-w-0">
                <span className="material-symbols-outlined text-lg shrink-0">wb_sunny</span>
                <span className="text-[13px] whitespace-nowrap">Morning Review</span>
              </div>
              <span className="text-[9.5px] font-bold bg-type-action-bg text-type-action px-1.5 py-0.5 rounded-full flex items-center gap-0.5 shrink-0">
                <span className="material-symbols-outlined text-[10px] font-bold leading-none">check</span>
                <span>Done</span>
              </span>
            </Link>

            <Link
              href="/inbox"
              onClick={handleLinkClick}
              className={`flex items-center justify-between px-unit-md py-unit-xs rounded-xl transition-all ${
                pathname === '/inbox'
                  ? 'bg-primary text-on-primary font-semibold shadow-[0_2px_8px_rgba(7,37,23,0.12)]'
                  : 'text-text-secondary hover:bg-surface-container-high hover:text-text-primary'
              }`}
            >
              <div className="flex items-center gap-unit-md">
                <span className="material-symbols-outlined text-xl">inbox</span>
                <span className="text-[13.5px]">Inbox / Capture</span>
              </div>
              <span className="text-[11px] font-semibold bg-surface-container-highest text-text-secondary px-unit-xs py-0.5 rounded-full min-w-[20px] text-center">
                {inboxCount}
              </span>
            </Link>

            <Link
              href="/people"
              onClick={handleLinkClick}
              className={`flex items-center justify-between px-unit-md py-unit-xs rounded-xl transition-all ${
                pathname === '/people'
                  ? 'bg-primary text-on-primary font-semibold shadow-[0_2px_8px_rgba(7,37,23,0.12)]'
                  : 'text-text-secondary hover:bg-surface-container-high hover:text-text-primary'
              }`}
            >
              <div className="flex items-center gap-unit-md">
                <span className="material-symbols-outlined text-xl">group</span>
                <span className="text-[13.5px]">People & Contacts</span>
              </div>
            </Link>

            <Link
              href="/meetings"
              onClick={handleLinkClick}
              className={`flex items-center justify-between px-unit-md py-unit-xs rounded-xl transition-all ${
                pathname?.startsWith('/meetings')
                  ? 'bg-primary text-on-primary font-semibold shadow-[0_2px_8px_rgba(7,37,23,0.12)]'
                  : 'text-text-secondary hover:bg-surface-container-high hover:text-text-primary'
              }`}
            >
              <div className="flex items-center gap-unit-md">
                <span className="material-symbols-outlined text-xl">event_note</span>
                <span className="text-[13.5px]">Meetings</span>
              </div>
            </Link>

            <Link
              href="/projects"
              onClick={handleLinkClick}
              className={`flex items-center justify-between px-unit-md py-unit-xs rounded-xl transition-all ${
                pathname === '/projects' || pathname === '/areas'
                  ? 'bg-primary text-on-primary font-semibold shadow-[0_2px_8px_rgba(7,37,23,0.12)]'
                  : 'text-text-secondary hover:bg-surface-container-high hover:text-text-primary'
              }`}
            >
              <div className="flex items-center gap-unit-md">
                <span className="material-symbols-outlined text-xl">folder_copy</span>
                <span className="text-[13.5px]">PARA Archive</span>
              </div>
            </Link>
          </nav>
        </div>

        {/* Navigation Group: Others */}
        <div className="flex flex-col gap-unit-md">
          <div className="px-unit-xs text-[10.5px] font-bold text-text-muted uppercase tracking-wider">
            Others
          </div>
          <nav className="flex flex-col gap-unit-2xs">
            <Link
              href="/items?type=resource"
              onClick={handleLinkClick}
              className="flex items-center justify-between px-unit-md py-unit-xs rounded-xl text-text-secondary hover:bg-surface-container-high hover:text-text-primary transition-all"
            >
              <div className="flex items-center gap-unit-md">
                <span className="material-symbols-outlined text-xl">local_library</span>
                <span className="text-[13.5px]">Resources</span>
              </div>
            </Link>

            <Link
              href="/test-connection"
              onClick={handleLinkClick}
              className="flex items-center justify-between px-unit-md py-unit-xs rounded-xl text-text-secondary hover:bg-surface-container-high hover:text-text-primary transition-all"
            >
              <div className="flex items-center gap-unit-md">
                <span className="material-symbols-outlined text-xl">tune</span>
                <span className="text-[13.5px]">Settings</span>
              </div>
              <span className="text-[11px] font-semibold bg-surface-container-highest text-text-secondary px-unit-xs py-0.5 rounded-full min-w-[20px] text-center">
                0
              </span>
            </Link>

            <button
              onClick={() => alert('Support Second Brain: Panduan GTD • PARA Hub aktif.')}
              className="flex items-center justify-between px-unit-md py-unit-xs rounded-xl text-text-secondary hover:bg-surface-container-high hover:text-text-primary transition-all text-left w-full"
            >
              <div className="flex items-center gap-unit-md">
                <span className="material-symbols-outlined text-xl">help_outline</span>
                <span className="text-[13.5px]">Support</span>
              </div>
            </button>
          </nav>
        </div>
      </div>

      {/* Bottom Profile */}
      <div className="p-unit-md m-unit-sm bg-surface-container rounded-xl flex items-center justify-between shrink-0">
        <div className="flex items-center gap-unit-md min-w-0">
          <div className="w-8 h-8 rounded-full bg-sage-medium text-white flex items-center justify-center font-bold text-xs shrink-0 ring-1 ring-border-strong">
            {userName.slice(0, 2).toUpperCase()}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1 leading-tight">
              <span className="text-[14px] font-semibold text-text-primary truncate">{userName}</span>
              <span className="material-symbols-outlined text-sm text-type-action">check_circle</span>
            </div>
            <div className="text-[12px] text-text-muted truncate">{displayEmail}</div>
          </div>
        </div>
        <button
          aria-label="Account settings"
          className="text-text-muted hover:text-text-primary transition-colors flex items-center justify-center p-1"
          type="button"
        >
          <span className="material-symbols-outlined text-base">expand_more</span>
        </button>
      </div>
    </aside>
  );
}
