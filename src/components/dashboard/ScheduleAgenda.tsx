'use client';

import { useState } from 'react';

export interface MeetingItem {
  id: string;
  title: string;
  time: string;
  type: 'WAITING' | 'ACTION' | 'RESOURCE';
  attendees: { id: string; name: string; monogram: string; color: string }[];
  additionalMembersCount: number;
  questions: { id: string; personName: string; text: string; tag: string }[];
}

const WEEK_DAYS = [
  { dayName: 'Sat', dayNum: '02' },
  { dayName: 'Sun', dayNum: '03' },
  { dayName: 'Mon', dayNum: '04', isToday: true },
  { dayName: 'Tue', dayNum: '05' },
  { dayName: 'Wed', dayNum: '06' },
];

interface ScheduleAgendaProps {
  initialMeetings?: MeetingItem[];
}

export default function ScheduleAgenda({ initialMeetings }: ScheduleAgendaProps) {
  const [selectedDay, setSelectedDay] = useState('04');
  const [activeTab, setActiveTab] = useState<'all' | 'action' | 'waiting'>('all');
  const [meetingsDone, setMeetingsDone] = useState<Record<string, boolean>>({});

  const meetings = initialMeetings && initialMeetings.length > 0 ? initialMeetings : [
    {
      id: 'm-1',
      title: 'Weekly Sync Team Lead',
      time: '10:00 - 10:45 WIB',
      type: 'WAITING' as const,
      attendees: [
        { id: '1', name: 'Agus C.', monogram: 'AC', color: '#2A5C43' },
        { id: '2', name: 'Rina I.', monogram: 'RI', color: '#B45309' },
        { id: '3', name: 'Budi S.', monogram: 'BS', color: '#2E5C6E' },
      ],
      additionalMembersCount: 2,
      questions: [
        { id: 'q-1', personName: 'Agus', text: 'Deadline v2.4 (terbawa 2h)', tag: 'Blocker' },
        { id: 'q-2', personName: 'Rina', text: 'Budget Datadog Q4', tag: 'Follow-up' },
      ],
    },
    {
      id: 'm-2',
      title: 'Workflow Inbox Capture Mobile',
      time: '14:30 - 16:00 WIB',
      type: 'RESOURCE' as const,
      attendees: [],
      additionalMembersCount: 0,
      questions: [],
    },
    {
      id: 'm-3',
      title: 'End of Day Review & Sync',
      time: '17:00 - 17:45 WIB',
      type: 'ACTION' as const,
      attendees: [],
      additionalMembersCount: 0,
      questions: [],
    },
  ];

  const toggleDone = (id: string) => {
    setMeetingsDone((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const filteredMeetings = meetings.filter((m) => {
    if (activeTab === 'all') return true;
    if (activeTab === 'action' && m.type === 'ACTION') return true;
    if (activeTab === 'waiting' && m.type === 'WAITING') return true;
    return false;
  });

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
            <span>Semua {meetings.length}</span>
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
            <span>Action {meetings.filter((m) => m.type === 'ACTION').length}</span>
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
            <span>Waiting {meetings.filter((m) => m.type === 'WAITING').length}</span>
          </button>
        </div>
      </div>

      {/* Meeting Cards List */}
      <div className="space-y-3">
        {filteredMeetings.map((m) => {
          const isDone = meetingsDone[m.id];
          const isWaiting = m.type === 'WAITING';

          return (
            <div
              key={m.id}
              className="p-4 rounded-2xl bg-[#F6F8F5] border border-[#DFE6DC] space-y-3 shadow-2xs transition-all"
            >
              {/* Top row */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-mono text-[#58655B] font-semibold">
                    {m.time}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      m.type === 'WAITING'
                        ? 'bg-[#FEF3C7] text-[#B45309] border border-[#FDE68A]'
                        : m.type === 'ACTION'
                        ? 'bg-[#EBF4EE] text-[#2A5C43] border border-[#D1E7DD]'
                        : 'bg-[#E0F2FE] text-[#2E5C6E] border border-[#BAE6FD]'
                    }`}
                  >
                    {m.type}
                  </span>
                </div>
                <span className="text-xs text-[#8A978E]">⌃</span>
              </div>

              <h4 className="font-bold text-sm text-[#19241C]">{m.title}</h4>

              {/* Attendees & Video Link */}
              {m.attendees && m.attendees.length > 0 && (
                <div className="flex items-center justify-between gap-2 pt-1">
                  <div className="flex items-center gap-1 text-[11px] text-[#58655B]">
                    <div className="flex -space-x-1.5">
                      {m.attendees.map((att) => (
                        <span
                          key={att.id}
                          style={{ backgroundColor: att.color }}
                          className="w-5 h-5 rounded-full text-white text-[9px] font-bold flex items-center justify-center border border-white"
                        >
                          {att.monogram}
                        </span>
                      ))}
                    </div>
                    {m.additionalMembersCount > 0 && (
                      <span className="text-[10px] text-[#8A978E] ml-1">
                        +{m.additionalMembersCount} members
                      </span>
                    )}
                  </div>

                  <button className="px-2.5 py-1 rounded-lg bg-white border border-[#DFE6DC] text-[10px] font-bold text-[#19241C] flex items-center gap-1 hover:bg-[#F6F8F5]">
                    <span>📹</span>
                    <span>Google Meet</span>
                  </button>
                </div>
              )}

              {/* Sub-Card: Questions & Follow-ups */}
              {isWaiting && m.questions && m.questions.length > 0 && (
                <div className="p-3 bg-white border border-[#DFE6DC] rounded-xl space-y-2.5">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-bold text-[#19241C]">Pertanyaan &amp; Follow-up (PRD 5.4):</span>
                    <span className="px-1.5 py-0.5 rounded bg-[#FEF3C7] text-[#B45309] text-[10px] font-bold">
                      {m.questions.length} Waiting
                    </span>
                  </div>

                  <div className="space-y-1.5 text-xs text-[#19241C]">
                    {m.questions.map((q) => (
                      <div key={q.id} className="flex items-center justify-between text-[11px]">
                        <span className="truncate pr-2">• {q.personName}: {q.text}</span>
                        <span
                          className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                            q.tag === 'Blocker'
                              ? 'bg-[#FEE2E2] text-[#DC2626]'
                              : 'bg-[#FEF3C7] text-[#B45309]'
                          }`}
                        >
                          {q.tag}
                        </span>
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={() => toggleDone(m.id)}
                    className={`w-full py-1.5 rounded-lg text-xs font-semibold transition-all border ${
                      isDone
                        ? 'bg-[#EBF4EE] text-[#2A5C43] border-[#CBD5C8]'
                        : 'bg-[#F6F8F5] hover:bg-[#EFF3ED] text-[#19241C] border-[#DFE6DC]'
                    }`}
                  >
                    {isDone ? '✓ Ditandai Selesai' : '✓ Tandai Selesai / Terjawab'}
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
