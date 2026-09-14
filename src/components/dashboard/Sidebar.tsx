'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image';

interface SidebarProps {
  userEmail?: string | null;
  inboxCount?: number;
}

export default function Sidebar({ userEmail, inboxCount = 0 }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-white border-r border-[#DFE6DC] flex flex-col justify-between h-screen sticky top-0 shrink-0 select-none">
      {/* Top Section */}
      <div className="p-4 space-y-5 overflow-y-auto">
        {/* Workspace Switcher */}
        <div className="flex items-center justify-between p-2 rounded-2xl hover:bg-[#F6F8F5] transition-colors cursor-pointer border border-transparent hover:border-[#DFE6DC]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#162B20] text-white flex items-center justify-center text-lg font-bold shadow-sm">
              🧠
            </div>
            <div className="leading-tight">
              <div className="font-bold text-xs text-[#19241C]">Second Brain</div>
              <div className="text-[10px] text-[#8A978E] font-medium">GTD • PARA Hub</div>
            </div>
          </div>
          <span className="text-xs text-[#8A978E]">⇅</span>
        </div>

        {/* Quick Search */}
        <div className="relative">
          <span className="absolute left-3 top-2.5 text-xs text-[#8A978E]">🔍</span>
          <input
            type="text"
            placeholder="Quick search..."
            readOnly
            className="w-full pl-8 pr-10 py-2 bg-[#F6F8F5] border border-[#DFE6DC] rounded-xl text-xs text-[#19241C] placeholder-[#8A978E] focus:outline-none cursor-pointer"
          />
          <span className="absolute right-2.5 top-2 px-1.5 py-0.5 rounded bg-white border border-[#DFE6DC] text-[9px] font-mono text-[#8A978E]">
            ⌘F
          </span>
        </div>

        {/* Navigation Group: MAIN */}
        <div className="space-y-1">
          <div className="px-3 text-[10px] font-bold uppercase tracking-wider text-[#8A978E]">
            MAIN
          </div>

          <Link
            href="/"
            className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
              pathname === '/'
                ? 'bg-[#162B20] text-white shadow-sm'
                : 'text-[#58655B] hover:text-[#19241C] hover:bg-[#F6F8F5]'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <span>⊞</span>
              <span>Dashboard</span>
            </div>
            {pathname === '/' && <span className="text-[10px] opacity-80">›</span>}
          </Link>

          <Link
            href="/items"
            className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
              pathname === '/items'
                ? 'bg-[#162B20] text-white shadow-sm font-semibold'
                : 'text-[#58655B] hover:text-[#19241C] hover:bg-[#F6F8F5]'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <span>📋</span>
              <span>Open Items</span>
            </div>
          </Link>

          <Link
            href="/inbox"
            className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
              pathname === '/inbox'
                ? 'bg-[#162B20] text-white shadow-sm font-semibold'
                : 'text-[#58655B] hover:text-[#19241C] hover:bg-[#F6F8F5]'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <span>📥</span>
              <span>Inbox / Capture</span>
            </div>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#EFF3ED] text-[#2A5C43]">
              {inboxCount}
            </span>
          </Link>

          <Link
            href="/people"
            className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
              pathname === '/people'
                ? 'bg-[#162B20] text-white shadow-sm font-semibold'
                : 'text-[#58655B] hover:text-[#19241C] hover:bg-[#F6F8F5]'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <span>👥</span>
              <span>People & Contacts</span>
            </div>
          </Link>

          <Link
            href="/projects"
            className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
              pathname === '/projects'
                ? 'bg-[#162B20] text-white shadow-sm font-semibold'
                : 'text-[#58655B] hover:text-[#19241C] hover:bg-[#F6F8F5]'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <span>🎯</span>
              <span>Projects (PARA)</span>
            </div>
          </Link>

          <Link
            href="/areas"
            className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
              pathname === '/areas'
                ? 'bg-[#162B20] text-white shadow-sm font-semibold'
                : 'text-[#58655B] hover:text-[#19241C] hover:bg-[#F6F8F5]'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <span>📁</span>
              <span>Areas</span>
            </div>
          </Link>
        </div>

        {/* Navigation Group: OTHERS */}
        <div className="space-y-1 pt-2">
          <div className="px-3 text-[10px] font-bold uppercase tracking-wider text-[#8A978E]">
            OTHERS
          </div>

          <Link
            href="/capture"
            className="flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium text-[#58655B] hover:text-[#19241C] hover:bg-[#F6F8F5] transition-all"
          >
            <div className="flex items-center gap-2.5">
              <span>⚡</span>
              <span>Quick Capture PWA</span>
            </div>
          </Link>

          <Link
            href="/test-connection"
            className="flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium text-[#58655B] hover:text-[#19241C] hover:bg-[#F6F8F5] transition-all"
          >
            <div className="flex items-center gap-2.5">
              <span>⚙️</span>
              <span>Settings & Database</span>
            </div>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#EFF3ED] text-[#8A978E]">
              0
            </span>
          </Link>
        </div>
      </div>

      {/* Bottom User Profile Section */}
      <div className="p-3 border-t border-[#DFE6DC] m-2">
        <div className="flex items-center justify-between p-2 rounded-2xl bg-[#F6F8F5] border border-[#DFE6DC] hover:border-[#CBD5C8] transition-all cursor-pointer">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="relative w-8 h-8 rounded-full overflow-hidden shrink-0 border border-[#CBD5C8]">
              <Image
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=120"
                alt="User Avatar"
                fill
                className="object-cover"
                unoptimized
              />
            </div>
            <div className="min-w-0 leading-tight">
              <div className="font-bold text-xs text-[#19241C] flex items-center gap-1 truncate">
                <span>Lauren Mitchell</span>
                <span className="text-[10px] text-emerald-600">✓</span>
              </div>
              <div className="text-[10px] text-[#8A978E] truncate">
                {userEmail || 'lauren@gmail.com'}
              </div>
            </div>
          </div>
          <span className="text-xs text-[#8A978E] ml-1">⌄</span>
        </div>
      </div>
    </aside>
  );
}
