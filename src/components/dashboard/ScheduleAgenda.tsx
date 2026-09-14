'use client';

import { useState } from 'react';

const WEEK_DAYS = [
  { dayName: 'Sat', dayNum: '02' },
  { dayName: 'Sun', dayNum: '03' },
  { dayName: 'Mon', dayNum: '04', isToday: true },
  { dayName: 'Tue', dayNum: '05' },
  { dayName: 'Wed', dayNum: '06' },
];

export default function ScheduleAgenda() {
  const [selectedDay, setSelectedDay] = useState('04');
  const [activeTab, setActiveTab] = useState<'all' | 'action' | 'waiting'>('all');
  const [meetingDone, setMeetingDone] = useState(false);

  return (
    <div className="bg-white border border-[#DFE6DC] rounded-3xl p-6 shadow-sm space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm text-[#19241C]">📅</span>
          <h3 className="font-bold text-xs uppercase tracking-wider text-[#19241C]">
            Schedule
          </h3>
        </div>

        <button className="text-xs font-semibold text-[#58655B] hover:text-[#19241C] transition-colors">
          See All
        </button>
      </div>

      {/* Weekly Date Selector Strip */}
      <div className="bg-[#F6F8F5] border border-[#DFE6DC] rounded-2xl p-2 space-y-2">
        <div className="flex items-center justify-between text-xs font-bold text-[#19241C] px-2">
          <button className="text-[#8A978E] hover:text-[#19241C]">‹</button>
          <span>August 2025</span>
          <button className="text-[#8A978E] hover:text-[#19241C]">›</button>
        </div>

        <div className="grid grid-cols-5 gap-1 text-center">
          {WEEK_DAYS.map((w) => {
            const isSelected = selectedDay === w.dayNum;
            return (
              <button
                key={w.dayNum}
                onClick={() => setSelectedDay(w.dayNum)}
                className={`py-2 px-1 rounded-xl transition-all flex flex-col items-center gap-0.5 ${
                  isSelected
                    ? 'bg-[#1E3B2B] text-white shadow-sm font-bold'
                    : 'text-[#58655B] hover:bg-white/80'
                }`}
              >
                <span className="text-[10px] font-medium opacity-80">{w.dayName}</span>
                <span className="text-xs font-mono font-bold">{w.dayNum}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Search Bar & Filters */}
      <div className="space-y-2.5">
        <div className="relative">
          <span className="absolute left-3 top-2 text-xs text-[#8A978E]">🔍</span>
          <input
            type="text"
            placeholder="Search schedule..."
            className="w-full pl-8 pr-12 py-1.5 bg-[#F6F8F5] border border-[#DFE6DC] rounded-xl text-xs text-[#19241C] placeholder-[#8A978E] focus:outline-none"
          />
          <span className="absolute right-2.5 top-1.5 px-1.5 py-0.5 rounded bg-white border border-[#DFE6DC] text-[9px] font-mono text-[#8A978E]">
            ⌘I
          </span>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 text-xs">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-3 py-1 rounded-lg font-semibold transition-all flex items-center gap-1 text-[11px] ${
              activeTab === 'all'
                ? 'bg-[#1E3B2B] text-white'
                : 'bg-[#F6F8F5] text-[#58655B] hover:text-[#19241C]'
            }`}
          >
            <span>📑</span>
            <span>Semua 3</span>
          </button>
          <button
            onClick={() => setActiveTab('action')}
            className={`px-3 py-1 rounded-lg font-semibold transition-all flex items-center gap-1 text-[11px] ${
              activeTab === 'action'
                ? 'bg-[#EBF4EE] text-[#2A5C43] border border-[#CBD5C8]'
                : 'bg-[#F6F8F5] text-[#58655B] hover:text-[#19241C]'
            }`}
          >
            <span>✓</span>
            <span>Action 1</span>
          </button>
          <button
            onClick={() => setActiveTab('waiting')}
            className={`px-3 py-1 rounded-lg font-semibold transition-all flex items-center gap-1 text-[11px] ${
              activeTab === 'waiting'
                ? 'bg-[#FEF3C7] text-[#B45309] border border-[#FDE68A]'
                : 'bg-[#F6F8F5] text-[#58655B] hover:text-[#19241C]'
            }`}
          >
            <span>⏳</span>
            <span>Waiting 2</span>
          </button>
        </div>
      </div>

      {/* Meeting Cards List */}
      <div className="space-y-3">
        {/* Card 1: Weekly Sync (Active / Detailed) */}
        {(activeTab === 'all' || activeTab === 'waiting') && (
          <div className="p-4 rounded-2xl bg-[#F6F8F5] border border-[#DFE6DC] space-y-3 shadow-2xs">
            {/* Top row */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono text-[#58655B] font-semibold">
                  10:00 - 10:45 WIB
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#FEF3C7] text-[#B45309] border border-[#FDE68A]">
                  ⏳ WAITING
                </span>
              </div>
              <span className="text-xs text-[#8A978E]">⌃</span>
            </div>

            <h4 className="font-bold text-sm text-[#19241C]">Weekly Sync Team Lead</h4>

            {/* Attendees & Google Meet */}
            <div className="flex items-center justify-between gap-2 pt-1">
              <div className="flex items-center gap-1 text-[11px] text-[#58655B]">
                <div className="flex -space-x-1.5">
                  <span className="w-5 h-5 rounded-full bg-[#2A5C43] text-white text-[9px] font-bold flex items-center justify-center border border-white">
                    AC
                  </span>
                  <span className="w-5 h-5 rounded-full bg-[#B45309] text-white text-[9px] font-bold flex items-center justify-center border border-white">
                    RI
                  </span>
                  <span className="w-5 h-5 rounded-full bg-[#2E5C6E] text-white text-[9px] font-bold flex items-center justify-center border border-white">
                    BS
                  </span>
                </div>
                <span className="text-[10px] text-[#8A978E] ml-1">+2 members</span>
              </div>

              <button className="px-2.5 py-1 rounded-lg bg-white border border-[#DFE6DC] text-[10px] font-bold text-[#19241C] flex items-center gap-1 hover:bg-[#F6F8F5]">
                <span>📹</span>
                <span>Google Meet</span>
              </button>
            </div>

            {/* Sub-Card: Questions & Follow-ups (PRD 5.4) */}
            <div className="p-3 bg-white border border-[#DFE6DC] rounded-xl space-y-2.5">
              <div className="flex items-center justify-between text-[11px]">
                <span className="font-bold text-[#19241C]">Pertanyaan &amp; Follow-up (PRD 5.4):</span>
                <span className="px-1.5 py-0.5 rounded bg-[#FEF3C7] text-[#B45309] text-[10px] font-bold">
                  2 Waiting
                </span>
              </div>

              <div className="space-y-1.5 text-xs text-[#19241C]">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="truncate pr-2">• Agus: Deadline v2.4 (terbawa 2h)</span>
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-[#FEE2E2] text-[#DC2626]">
                    Blocker
                  </span>
                </div>
                <div className="flex items-center justify-between text-[11px]">
                  <span className="truncate pr-2">• Rina: Budget Datadog Q4</span>
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-[#FEF3C7] text-[#B45309]">
                    Follow-up
                  </span>
                </div>
              </div>

              <button
                onClick={() => setMeetingDone(!meetingDone)}
                className={`w-full py-1.5 rounded-lg text-xs font-semibold transition-all border ${
                  meetingDone
                    ? 'bg-[#EBF4EE] text-[#2A5C43] border-[#CBD5C8]'
                    : 'bg-[#F6F8F5] hover:bg-[#EFF3ED] text-[#19241C] border-[#DFE6DC]'
                }`}
              >
                {meetingDone ? '✓ Ditandai Selesai' : '✓ Tandai Selesai / Terjawab'}
              </button>
            </div>
          </div>
        )}

        {/* Card 2: Resource */}
        {(activeTab === 'all' || activeTab === 'action') && (
          <div className="p-3.5 rounded-2xl bg-white border border-[#DFE6DC] hover:border-[#CBD5C8] transition-all space-y-1">
            <div className="flex items-center justify-between text-[11px]">
              <span className="font-mono text-[#58655B]">14:30 - 16:00 WIB</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#E0F2FE] text-[#2E5C6E]">
                📖 RESOURCE
              </span>
            </div>
            <div className="flex items-center justify-between">
              <h5 className="font-semibold text-xs text-[#19241C]">Workflow Inbox Capture Mobile</h5>
              <span className="text-xs text-[#8A978E]">⌄</span>
            </div>
          </div>
        )}

        {/* Card 3: Action */}
        {(activeTab === 'all' || activeTab === 'action') && (
          <div className="p-3.5 rounded-2xl bg-white border border-[#DFE6DC] hover:border-[#CBD5C8] transition-all space-y-1">
            <div className="flex items-center justify-between text-[11px]">
              <span className="font-mono text-[#58655B]">17:00 - 17:45 WIB</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#EBF4EE] text-[#2A5C43]">
                ✓ ACTION
              </span>
            </div>
            <div className="flex items-center justify-between">
              <h5 className="font-semibold text-xs text-[#19241C]">End of Day Review &amp; Sync</h5>
              <span className="text-xs text-[#8A978E]">⌄</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
