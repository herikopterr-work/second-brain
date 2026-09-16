'use client';

import { useState } from 'react';
import Link from 'next/link';
import { markWaitingItemDone } from '@/lib/dashboard/actions';

export interface MeetingItem {
  id: string;
  title: string;
  time: string;
  type: 'WAITING' | 'ACTION' | 'RESOURCE';
  attendees: { id: string; name: string; monogram: string; color: string }[];
  additionalMembersCount: number;
  questions: { id: string; personName: string; text: string; tag: string }[];
}

interface ScheduleAgendaProps {
  initialMeetings?: MeetingItem[];
}

export default function ScheduleAgenda({ initialMeetings = [] }: ScheduleAgendaProps) {
  // Default mock meetings matching Stitch
  const defaultMeetings: MeetingItem[] = [
    {
      id: 'm-1',
      title: 'Weekly Sync Team Lead',
      time: '10:00 – 10:45 WIB',
      type: 'WAITING',
      attendees: [
        { id: '1', name: 'Agus', monogram: 'AG', color: 'bg-sage-light text-forest-dark' },
        { id: '2', name: 'Rina', monogram: 'RI', color: 'bg-secondary-container text-forest-dark' },
        { id: '3', name: 'Budi Santoso', monogram: 'BS', color: 'bg-type-action-bg text-type-action' },
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
      time: '14:30 – 16:00 WIB',
      type: 'RESOURCE',
      attendees: [],
      additionalMembersCount: 0,
      questions: [],
    },
    {
      id: 'm-3',
      title: 'End of Day Review & Sync',
      time: '17:00 – 17:45 WIB',
      type: 'ACTION',
      attendees: [],
      additionalMembersCount: 0,
      questions: [],
    },
  ];

  const [meetings] = useState<MeetingItem[]>(
    initialMeetings.length > 0 ? initialMeetings : defaultMeetings
  );

  const [selectedDay, setSelectedDay] = useState('04');
  const [activeTab, setActiveTab] = useState<'all' | 'action' | 'waiting' | 'meeting'>('all');
  const [expandedId, setExpandedId] = useState<string | null>('m-1');
  const [answeredMap, setAnsweredMap] = useState<Record<string, boolean>>({});
  const [allAnswered, setAllAnswered] = useState(false);

  const handleMarkAnswered = async (questionId: string) => {
    setAnsweredMap((prev) => ({ ...prev, [questionId]: true }));
    try {
      await markWaitingItemDone(questionId);
    } catch (err) {
      console.error('Gagal mark answered:', err);
    }
  };

  const handleMarkAllAnswered = () => {
    setAllAnswered(true);
  };

  const filteredMeetings = meetings.filter((m) => {
    if (activeTab === 'all') return true;
    if (activeTab === 'action' && m.type === 'ACTION') return true;
    if (activeTab === 'waiting' && m.type === 'WAITING') return true;
    if (activeTab === 'meeting') return m.attendees.length > 0 || m.title.toLowerCase().includes('sync');
    return false;
  });

  const waitingCount = meetings.filter((m) => m.type === 'WAITING').length;
  const actionCount = meetings.filter((m) => m.type === 'ACTION').length;
  const meetingCount = meetings.filter((m) => m.attendees.length > 0 || m.title.toLowerCase().includes('sync')).length;

  return (
    <div className="bg-surface-elevated rounded-2xl p-unit-lg shadow-sm flex flex-col gap-unit-sm flex-1 border border-border-subtle h-full">
      {/* Header */}
      <div className="flex items-center justify-between h-7 shrink-0">
        <div className="flex items-center gap-unit-xs">
          <span className="material-symbols-outlined text-sage-medium text-base">calendar_month</span>
          <span className="text-[14px] text-forest-dark font-semibold">Schedule</span>
        </div>
        <Link
          href="/meetings"
          className="text-[12px] font-semibold text-text-muted hover:text-text-primary transition-colors"
        >
          See All
        </Link>
      </div>

      {/* Mini Calendar Strip */}
      <div className="flex flex-col gap-1 bg-surface-container-low p-unit-sm rounded-xl border border-border-subtle/50">
        <div className="flex items-center justify-between px-unit-xs">
          <button
            aria-label="Previous month"
            className="text-text-muted hover:text-text-primary transition-colors p-0.5"
            type="button"
          >
            <span className="material-symbols-outlined text-sm">chevron_left</span>
          </button>
          <span className="text-[12.5px] text-forest-dark font-semibold">August 2025</span>
          <button
            aria-label="Next month"
            className="text-text-muted hover:text-text-primary transition-colors p-0.5"
            type="button"
          >
            <span className="material-symbols-outlined text-sm">chevron_right</span>
          </button>
        </div>

        <div className="grid grid-cols-5 gap-unit-xs pt-1">
          {[
            { day: 'Sat', num: '02' },
            { day: 'Sun', num: '03' },
            { day: 'Mon', num: '04' },
            { day: 'Tue', num: '05' },
            { day: 'Wed', num: '06' },
          ].map((item) => {
            const isSelected = selectedDay === item.num;
            return (
              <button
                key={item.num}
                type="button"
                onClick={() => setSelectedDay(item.num)}
                className={`flex flex-col items-center py-1 rounded-lg transition-all ${
                  isSelected
                    ? 'bg-forest-dark text-on-primary shadow-xs'
                    : 'hover:bg-surface-container text-text-muted'
                }`}
              >
                <span className={`text-[11px] ${isSelected ? 'opacity-80' : 'text-text-muted'}`}>
                  {item.day}
                </span>
                <span
                  className={`text-[13px] leading-tight ${
                    isSelected ? 'font-bold' : 'text-text-primary font-semibold'
                  }`}
                >
                  {item.num}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Schedule Search Field */}
      <div className="relative flex items-center">
        <span className="material-symbols-outlined absolute left-unit-md text-text-muted text-base pointer-events-none">
          search
        </span>
        <input
          className="w-full bg-surface-container-low pl-9 pr-14 py-unit-xs rounded-xl text-[12px] text-text-primary placeholder:text-text-muted focus:outline-none focus:bg-surface-elevated transition-all border border-border-subtle/40"
          placeholder="Search schedule..."
          type="text"
        />
        <div className="absolute right-unit-sm flex items-center gap-1">
          <span className="text-[10px] font-semibold text-text-muted bg-surface-container px-unit-2xs py-0.5 rounded">
            ⌘1
          </span>
          <span className="material-symbols-outlined text-text-muted text-base">tune</span>
        </div>
      </div>

      {/* Filter Segmented Tabs */}
      <div className="flex items-center gap-1 pb-unit-xs overflow-x-auto scrollbar-none">
        <button
          type="button"
          onClick={() => setActiveTab('all')}
          className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[12px] font-semibold transition-all shrink-0 ${
            activeTab === 'all'
              ? 'bg-surface-container text-forest-dark shadow-xs'
              : 'text-text-secondary hover:bg-surface-container-low'
          }`}
        >
          <span className="material-symbols-outlined text-[13px]">list_alt</span>
          <span>Semua</span>
          <span className="text-[10.5px] opacity-70">3</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('action')}
          className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[12px] font-semibold transition-all shrink-0 ${
            activeTab === 'action'
              ? 'bg-surface-container text-forest-dark shadow-xs'
              : 'text-text-secondary hover:bg-surface-container-low'
          }`}
        >
          <span className="material-symbols-outlined text-[13px] text-type-action">check_circle</span>
          <span>Action</span>
          <span className="text-[10.5px] opacity-70">{actionCount}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('waiting')}
          className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[12px] font-semibold transition-all shrink-0 ${
            activeTab === 'waiting'
              ? 'bg-surface-container text-forest-dark shadow-xs'
              : 'text-text-secondary hover:bg-surface-container-low'
          }`}
        >
          <span className="material-symbols-outlined text-[13px] text-type-waiting">hourglass_empty</span>
          <span>Waiting</span>
          <span className="text-[10.5px] opacity-70">{waitingCount}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('meeting')}
          className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[12px] font-semibold transition-all shrink-0 ${
            activeTab === 'meeting'
              ? 'bg-surface-container text-forest-dark shadow-xs'
              : 'text-text-secondary hover:bg-surface-container-low'
          }`}
        >
          <span className="material-symbols-outlined text-[13px] text-sage-deep">videocam</span>
          <span>Meeting</span>
          <span className="text-[10.5px] opacity-70">{meetingCount}</span>
        </button>
      </div>

      {/* Agenda Meeting Cards Stack */}
      <div className="flex-1 min-h-0 flex flex-col gap-unit-xs overflow-y-auto pr-1">
        {filteredMeetings.map((item) => {
          const isExpanded = expandedId === item.id;

          if (isExpanded) {
            return (
              <div
                key={item.id}
                className="bg-surface-container-low rounded-xl p-unit-md flex flex-col gap-unit-sm shadow-sm border border-border-subtle/50 transition-all"
              >
                <div className="flex items-start justify-between">
                  <div className="flex flex-col gap-1 min-w-0">
                    <div className="flex items-center gap-unit-xs">
                      <span className="text-[11.5px] text-text-muted font-medium">{item.time}</span>
                      <span className="text-[9.5px] font-bold bg-type-waiting-bg text-type-waiting px-1.5 py-0.5 rounded-full flex items-center gap-1">
                        <span className="material-symbols-outlined text-[10.5px] leading-none">hourglass_top</span>
                        <span>{item.type}</span>
                      </span>
                    </div>
                    <span className="text-[14px] text-forest-dark font-semibold leading-snug">
                      {item.title}
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleMarkAllAnswered()}
                      className="w-5 h-5 rounded-lg bg-surface-elevated text-type-action hover:bg-type-action-bg flex items-center justify-center transition-colors shadow-2xs border border-border-subtle/40"
                      title="Tandai Selesai"
                    >
                      <span className="material-symbols-outlined text-xs font-bold">check</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setExpandedId(null)}
                      className="w-5 h-5 rounded-lg text-text-muted hover:text-text-primary flex items-center justify-center transition-colors"
                      title="Collapse"
                    >
                      <span className="material-symbols-outlined text-sm">expand_less</span>
                    </button>
                  </div>
                </div>

                {/* Attendees & Google Meet */}
                <div className="flex items-center justify-between flex-wrap gap-unit-xs">
                  <div className="flex items-center gap-1">
                    <div className="flex -space-x-1.5 overflow-hidden">
                      {item.attendees.map((att) => (
                        <span
                          key={att.id}
                          className={`inline-flex items-center justify-center w-5 h-5 rounded-full text-[9px] font-bold ring-2 ring-surface-elevated ${att.color}`}
                        >
                          {att.monogram}
                        </span>
                      ))}
                    </div>
                    {item.additionalMembersCount > 0 && (
                      <span className="text-[11px] text-text-muted ml-1">
                        +{item.additionalMembersCount} members
                      </span>
                    )}
                  </div>

                  <a
                    href="https://meet.google.com"
                    target="_blank"
                    rel="noreferrer"
                    className="bg-surface-elevated hover:bg-white text-forest-dark text-[11px] font-semibold px-2 py-0.5 rounded-lg shadow-xs flex items-center gap-1 transition-all border border-border-subtle/60"
                  >
                    <span className="material-symbols-outlined text-xs text-sage-deep leading-none">videocam</span>
                    <span>Google Meet</span>
                  </a>
                </div>

                {/* Follow-up Questions Box */}
                {item.questions.length > 0 && (
                  <div className="bg-surface-elevated rounded-xl p-unit-md flex flex-col gap-unit-xs shadow-xs border border-border-subtle/50">
                    <div className="flex items-center justify-between">
                      <span className="text-[12.5px] text-forest-dark font-medium">
                        Pertanyaan &amp; Follow-up (PRD 5.4):
                      </span>
                      <span className="text-[10.5px] font-semibold bg-type-waiting-bg text-type-waiting px-unit-xs py-0.5 rounded">
                        {allAnswered ? '0 Waiting' : `${item.questions.length} Waiting`}
                      </span>
                    </div>

                    <div className="flex flex-col gap-unit-xs mt-1">
                      {item.questions.map((q) => {
                        const isDone = allAnswered || answeredMap[q.id];
                        return (
                          <div
                            key={q.id}
                            onClick={() => handleMarkAnswered(q.id)}
                            className={`flex items-center justify-between text-[12px] cursor-pointer hover:bg-surface-container-low p-1 rounded transition-colors ${
                              isDone ? 'line-through opacity-40' : ''
                            }`}
                          >
                            <div className="flex items-center gap-1.5 min-w-0">
                              <span
                                className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                                  q.tag === 'Blocker' ? 'bg-status-critical' : 'bg-type-waiting'
                                }`}
                              />
                              <span className="text-text-primary truncate">
                                {q.personName}: {q.text}
                              </span>
                            </div>

                            <span
                              className={`text-[10px] font-semibold px-unit-xs py-0.5 rounded shrink-0 ${
                                q.tag === 'Blocker'
                                  ? 'bg-status-critical-bg text-status-critical'
                                  : 'bg-type-waiting-bg text-type-waiting'
                              }`}
                            >
                              {q.tag}
                            </span>
                          </div>
                        );
                      })}
                    </div>

                    {/* Complete CTA Button */}
                    <button
                      type="button"
                      onClick={() => handleMarkAllAnswered()}
                      className="mt-unit-sm w-full py-unit-xs bg-surface-container-low hover:bg-surface-container text-[12.5px] font-semibold text-forest-dark rounded-xl flex items-center justify-center gap-1 transition-all border border-border-subtle/40"
                    >
                      <span className="material-symbols-outlined text-sm">check</span>
                      <span>{allAnswered ? 'Semua Ditandai Selesai' : 'Tandai Selesai / Terjawab'}</span>
                    </button>
                  </div>
                )}
              </div>
            );
          }

          // Collapsed state
          return (
            <div
              key={item.id}
              onClick={() => setExpandedId(item.id)}
              className="bg-surface-container-low rounded-xl px-unit-md py-1.5 flex items-center justify-between shadow-xs hover:bg-surface-container transition-all cursor-pointer border border-border-subtle/40"
            >
              <div className="flex flex-col gap-0.5 min-w-0">
                <div className="flex items-center gap-unit-xs">
                  <span className="text-[11.5px] text-text-muted">{item.time}</span>
                  <span
                    className={`text-[9.5px] font-bold px-1.5 py-0.5 rounded-full flex items-center gap-1 ${
                      item.type === 'RESOURCE'
                        ? 'bg-type-resource-bg text-type-resource'
                        : item.type === 'ACTION'
                        ? 'bg-type-action-bg text-type-action'
                        : 'bg-type-waiting-bg text-type-waiting'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[10.5px] leading-none">
                      {item.type === 'RESOURCE'
                        ? 'folder_open'
                        : item.type === 'ACTION'
                        ? 'check_circle'
                        : 'hourglass_top'}
                    </span>
                    <span>{item.type}</span>
                  </span>
                </div>
                <span className="text-[13px] text-forest-dark font-medium truncate">
                  {item.title}
                </span>
              </div>
              <span className="material-symbols-outlined text-text-muted text-sm">expand_more</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
