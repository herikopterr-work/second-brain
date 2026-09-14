'use client';

import { useState, useEffect } from 'react';
import Sidebar from '@/components/dashboard/Sidebar';
import HeaderBar from '@/components/dashboard/HeaderBar';
import GTDStateOverview from '@/components/dashboard/GTDStateOverview';
import OmniCaptureBar from '@/components/dashboard/OmniCaptureBar';
import VelocityChart from '@/components/dashboard/VelocityChart';
import TodaysWinning from '@/components/dashboard/TodaysWinning';
import ScheduleAgenda from '@/components/dashboard/ScheduleAgenda';
import MobileFrameWrapper from '@/components/dashboard/MobileFrameWrapper';
import { getDashboardData, type DashboardData } from '@/lib/dashboard/actions';
import Link from 'next/link';

export default function Home() {
  const [viewMode, setViewMode] = useState<'desktop' | 'mobile'>('desktop');
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const res = await getDashboardData();
        setData(res);
      } catch (err) {
        console.error('Gagal memuat dashboard data:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <div className="min-h-screen bg-[#EFF3ED] text-[#19241C] flex">
      {/* Sidebar Desktop */}
      {viewMode === 'desktop' && (
        <div className="hidden lg:block">
          <Sidebar
            userEmail={data?.userEmail}
            inboxCount={data?.inboxCount || 0}
          />
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        {/* Header Bar */}
        <HeaderBar
          viewMode={viewMode}
          onToggleViewMode={setViewMode}
          userEmail={data?.userEmail}
        />

        {/* Content Render berdasarkan View Mode */}
        {viewMode === 'desktop' ? (
          /* DESKTOP VIEW */
          <main className="flex-1 p-6 max-w-[1500px] w-full mx-auto space-y-6">
            {/* 1. GTD State Overview (4 Tiles) */}
            <GTDStateOverview
              actionCount={data?.actionCount ?? 14}
              waitingCount={data?.waitingCount ?? 5}
              criticalQuestionsCount={data?.criticalQuestionsCount ?? 2}
              top5StreakDays={data?.top5StreakDays ?? 5}
            />

            {/* 2. Omni Quick-Capture Bar */}
            <OmniCaptureBar />

            {/* 3. Main Dashboard 2-Column Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Left Column (7/12 width): Velocity + Top 5 Winning */}
              <div className="lg:col-span-7 space-y-6">
                <VelocityChart />
                <TodaysWinning initialItems={data?.todaysWinnings} />
              </div>

              {/* Right Column (5/12 width): Schedule & Meeting Agenda */}
              <div className="lg:col-span-5 space-y-6">
                <ScheduleAgenda initialMeetings={data?.scheduleMeetings} />
              </div>
            </div>
          </main>
        ) : (
          /* MOBILE PWA PREVIEW MODE */
          <MobileFrameWrapper>
            <div className="space-y-4">
              {/* Header Profile Singkat */}
              <div className="flex items-center justify-between bg-white p-3.5 rounded-2xl border border-[#DFE6DC] shadow-xs">
                <div className="flex items-center gap-2.5">
                  <span className="text-xl">🧠</span>
                  <div>
                    <h2 className="font-bold text-xs text-[#19241C]">Second Brain</h2>
                    <p className="text-[10px] text-[#8A978E]">Executive Sanctuary</p>
                  </div>
                </div>
                <Link
                  href="/capture"
                  className="px-3 py-1.5 rounded-xl bg-[#072517] text-white text-xs font-bold shadow-sm"
                >
                  + Capture
                </Link>
              </div>

              {/* Omni Quick-Capture Bar */}
              <OmniCaptureBar />

              {/* 4 Stat Overview (2x2 Grid) */}
              <GTDStateOverview
                actionCount={data?.actionCount ?? 14}
                waitingCount={data?.waitingCount ?? 5}
                criticalQuestionsCount={data?.criticalQuestionsCount ?? 2}
                top5StreakDays={data?.top5StreakDays ?? 5}
              />

              {/* Top 5 Today's Winning */}
              <TodaysWinning initialItems={data?.todaysWinnings} />

              {/* Schedule & Agenda */}
              <ScheduleAgenda initialMeetings={data?.scheduleMeetings} />

              {/* Bottom Quick Nav Bar */}
              <div className="grid grid-cols-3 gap-2 pt-2">
                <Link
                  href="/capture"
                  className="p-3 bg-white border border-[#DFE6DC] rounded-xl text-center shadow-xs"
                >
                  <div className="text-base">⚡</div>
                  <div className="text-[10px] font-bold text-[#19241C] mt-0.5">Capture</div>
                </Link>

                <Link
                  href="/inbox"
                  className="p-3 bg-white border border-[#DFE6DC] rounded-xl text-center shadow-xs"
                >
                  <div className="text-base">📥</div>
                  <div className="text-[10px] font-bold text-[#19241C] mt-0.5">Inbox</div>
                </Link>

                <Link
                  href="/items"
                  className="p-3 bg-white border border-[#DFE6DC] rounded-xl text-center shadow-xs"
                >
                  <div className="text-base">📋</div>
                  <div className="text-[10px] font-bold text-[#19241C] mt-0.5">Open Items</div>
                </Link>
              </div>
            </div>
          </MobileFrameWrapper>
        )}
      </div>
    </div>
  );
}
