'use client';

import { useState, useEffect } from 'react';
import Sidebar from '@/components/dashboard/Sidebar';
import HeaderBar from '@/components/dashboard/HeaderBar';
import MobileFrameWrapper from '@/components/dashboard/MobileFrameWrapper';
import { createClient } from '@/lib/supabase/client';

interface AppShellProps {
  children: React.ReactNode;
  userEmail?: string | null;
  inboxCount?: number;
  overflowHidden?: boolean;
  maxContentWidth?: string;
}

export default function AppShell({
  children,
  userEmail: initialEmail,
  inboxCount: initialInboxCount,
  overflowHidden = false,
  maxContentWidth,
}: AppShellProps) {
  const [viewMode, setViewMode] = useState<'desktop' | 'mobile'>('desktop');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(initialEmail ?? null);
  const [inboxCount, setInboxCount] = useState<number>(initialInboxCount ?? 0);

  useEffect(() => {
    if (initialEmail !== undefined) {
      setUserEmail(initialEmail);
    }
    if (initialInboxCount !== undefined) {
      setInboxCount(initialInboxCount);
    }
  }, [initialEmail, initialInboxCount]);

  useEffect(() => {
    // Only fetch if not supplied via props
    if (initialEmail !== undefined && initialInboxCount !== undefined) return;

    async function loadUserAndCounts() {
      try {
        const supabase = createClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (user?.email && initialEmail === undefined) {
          setUserEmail(user.email);
        }

        if (initialInboxCount === undefined) {
          const { count } = await supabase
            .from('items')
            .select('id', { count: 'exact', head: true })
            .eq('type', 'inbox')
            .eq('status', 'open')
            .is('archived_at', null);

          if (typeof count === 'number') {
            setInboxCount(count);
          }
        }
      } catch (err) {
        console.error('Error fetching shell metadata:', err);
      }
    }

    loadUserAndCounts();
  }, [initialEmail, initialInboxCount]);

  return (
    <div className="min-h-screen lg:h-screen lg:max-h-screen lg:overflow-hidden bg-canvas-base text-text-primary selection:bg-secondary-container selection:text-on-secondary-fixed flex flex-col">
      <div className="max-w-[1440px] w-full mx-auto p-unit-sm sm:p-unit-md flex-1 flex gap-unit-md items-stretch min-h-0">
        {/* Sidebar Desktop */}
        {viewMode === 'desktop' && (
          <div className="hidden lg:flex shrink-0 flex-col h-full">
            <Sidebar userEmail={userEmail} inboxCount={inboxCount} />
          </div>
        )}

        {/* Mobile Slide-over Drawer */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 lg:hidden flex">
            <div
              className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
              onClick={() => setMobileMenuOpen(false)}
            />
            <div className="relative z-10 w-[260px] bg-surface-card h-full shadow-2xl p-unit-xs">
              <Sidebar
                userEmail={userEmail}
                inboxCount={inboxCount}
                onClose={() => setMobileMenuOpen(false)}
              />
            </div>
          </div>
        )}

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 gap-unit-md h-full min-h-0">
          {/* Unified Top Header Bar */}
          <HeaderBar
            viewMode={viewMode}
            onToggleViewMode={setViewMode}
            userEmail={userEmail}
            onOpenMobileMenu={() => setMobileMenuOpen(true)}
          />

          {/* Page Content based on View Mode */}
          {viewMode === 'desktop' ? (
            <main
              className={`flex-1 min-h-0 flex flex-col gap-unit-md ${
                overflowHidden ? 'overflow-hidden' : 'overflow-y-auto pr-0.5'
              }`}
            >
              {children}
            </main>
          ) : (
            <MobileFrameWrapper>
              <div className="space-y-unit-md pb-6">{children}</div>
            </MobileFrameWrapper>
          )}
        </div>
      </div>
    </div>
  );
}
