'use client';

import { useState, useEffect } from 'react';
import AppShell from '@/components/layout/AppShell';
import GTDStateOverview from '@/components/dashboard/GTDStateOverview';
import OmniCaptureBar from '@/components/dashboard/OmniCaptureBar';
import VelocityChart from '@/components/dashboard/VelocityChart';
import TodaysWinning from '@/components/dashboard/TodaysWinning';
import ScheduleAgenda from '@/components/dashboard/ScheduleAgenda';
import { getDashboardData, type DashboardData } from '@/lib/dashboard/actions';

export default function Home() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await getDashboardData();
      setData(res);
    } catch (err) {
      console.error('Gagal memuat dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <AppShell
      userEmail={data?.userEmail}
      inboxCount={data?.inboxCount ?? 0}
      overflowHidden={true}
    >
      {/* 1. GTD State Overview (Top 4 Stat Cards) */}
      <GTDStateOverview
        actionCount={data?.actionCount ?? 14}
        waitingCount={data?.waitingCount ?? 5}
        criticalQuestionsCount={data?.criticalQuestionsCount ?? 2}
        top5StreakDays={data?.top5StreakDays ?? 5}
      />

      {/* 2. Omni Quick-Capture Bar */}
      <OmniCaptureBar />

      {/* 3. Main Dashboard 2-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-unit-md items-stretch flex-1 min-h-0">
        {/* Left Column (7/12 width): Velocity Chart + Top 5 Winning */}
        <div className="lg:col-span-7 flex flex-col gap-unit-md min-h-0">
          <div className="h-[350px] shrink-0 flex flex-col">
            <VelocityChart initialData={data?.weeklyVelocity} />
          </div>
          <div className="flex-1 min-h-0 flex flex-col">
            <TodaysWinning initialItems={data?.todaysWinnings} />
          </div>
        </div>

        {/* Right Column (5/12 width): Schedule & Meeting Agenda */}
        <div className="lg:col-span-5 flex flex-col gap-unit-md min-h-0">
          <div className="flex-1 min-h-0 flex flex-col">
            <ScheduleAgenda initialMeetings={data?.scheduleMeetings} />
          </div>
        </div>
      </div>
    </AppShell>
  );
}
