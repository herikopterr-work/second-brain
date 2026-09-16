'use client';

import { useState, useEffect } from 'react';
import { toggleWinningItemDone } from '@/lib/dashboard/actions';
import Link from 'next/link';
import { Calendar } from 'lucide-react';

export interface WinningItem {
  id: string;
  title: string;
  carryoverTag: string;
  isCriticalCarryover?: boolean;
  duration: string;
  dueDate: string;
  completed: boolean;
}

interface TodaysWinningProps {
  initialItems?: WinningItem[];
}

export default function TodaysWinning({ initialItems = [] }: TodaysWinningProps) {
  // Default mock items matching Stitch if initialItems is empty
  const defaultItems: WinningItem[] = [
    {
      id: 'w-1',
      title: 'Finalisasi arsitektur skema DB Partitioning PostgreSQL',
      carryoverTag: '▲ 3 hari terbawa',
      isCriticalCarryover: true,
      duration: '90m',
      dueDate: 'Aug 04',
      completed: false,
    },
    {
      id: 'w-2',
      title: 'Review merge request SLA alert pipeline',
      carryoverTag: 'Hari ke-1',
      isCriticalCarryover: false,
      duration: '45m',
      dueDate: 'Aug 04',
      completed: false,
    },
    {
      id: 'w-3',
      title: 'Draft dokumen RFC otentikasi biometric multi-tenant',
      carryoverTag: 'Hari ke-2',
      isCriticalCarryover: false,
      duration: '60m',
      dueDate: 'Aug 04',
      completed: false,
    },
    {
      id: 'w-4',
      title: 'Sinkronisasi ekspektasi roadmap Q4 dengan Product Management',
      carryoverTag: 'Hari ke-1',
      isCriticalCarryover: false,
      duration: '30m',
      dueDate: 'Aug 04',
      completed: false,
    },
    {
      id: 'w-5',
      title: 'Verifikasi checklist audit kepatuhan ISO 27001',
      carryoverTag: 'Baru',
      isCriticalCarryover: false,
      duration: '45m',
      dueDate: 'Aug 04',
      completed: false,
    },
  ];

  const [completedOverrides, setCompletedOverrides] = useState<Record<string, boolean>>({});

  const items: WinningItem[] = (initialItems.length > 0 ? initialItems : defaultItems).map((item) => ({
    ...item,
    completed:
      completedOverrides[item.id] !== undefined
        ? completedOverrides[item.id]
        : item.completed,
  }));

  const toggleCheck = async (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const target = items.find((i) => i.id === id);
    if (!target) return;

    const newCompleted = !target.completed;
    setCompletedOverrides((prev) => ({
      ...prev,
      [id]: newCompleted,
    }));

    try {
      await toggleWinningItemDone(id, target.completed);
    } catch (err) {
      console.error('Gagal update winning item:', err);
    }
  };

  return (
    <div className="bg-surface-elevated rounded-2xl p-unit-lg shadow-sm flex flex-col flex-1 border border-border-subtle h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-unit-sm">
        <div className="flex items-center gap-unit-xs min-w-0">
          <span className="material-symbols-outlined text-sage-medium text-base">verified_user</span>
          <span className="text-[13.5px] text-forest-dark truncate font-semibold">
            Top 5: Today&apos;s Winning
          </span>
        </div>

        <div className="flex items-center gap-unit-xs">
          <span className="text-[10.5px] font-semibold text-type-action bg-type-action-bg px-unit-xs py-0.5 rounded flex items-center gap-0.5">
            <span className="material-symbols-outlined text-xs">lock</span>
            <span>Terkunci Hari Ini</span>
          </span>
          <Link
            href="/items"
            className="text-[10.5px] font-semibold text-text-secondary bg-surface-container hover:bg-surface-container-high px-unit-xs py-0.5 rounded transition-colors"
          >
            + Add
          </Link>
        </div>
      </div>

      {/* List */}
      <div className="flex-1 min-h-0 flex flex-col gap-2 overflow-y-auto pr-0.5">
        {items.map((item) => (
          <div
            key={item.id}
            onClick={() => toggleCheck(item.id)}
            className="group px-unit-md py-2 rounded-xl bg-surface-container-low hover:bg-surface-container transition-all flex items-center justify-between cursor-pointer border border-border-subtle/40 h-[71px] shrink-0"
          >
            <div className="flex items-center gap-unit-md min-w-0 flex-1">
              {/* Circular Checkbox */}
              <button
                type="button"
                onClick={(e) => toggleCheck(item.id, e)}
                className={`w-5 h-5 rounded-full transition-all shrink-0 flex items-center justify-center ${item.completed
                  ? 'bg-primary text-white'
                  : 'border-2 border-sage-soft hover:bg-sage-light'
                  }`}
              >
                {item.completed && (
                  <span className="material-symbols-outlined text-xs font-bold">check</span>
                )}
              </button>

              {/* Title & Metadata */}
              <div className="flex flex-col min-w-0 flex-1 justify-center">
                <span
                  className={`text-[13.5px] leading-snug font-medium transition-all line-clamp-2 ${item.completed
                    ? 'line-through opacity-40 text-text-muted'
                    : 'text-text-primary'
                    }`}
                >
                  {item.title}
                </span>

                <div className="flex items-center gap-unit-sm mt-1.5 flex-wrap">
                  {/* Carryover / Status Badge */}
                  <span
                    className={`text-[10.5px] font-semibold px-2 py-0.5 rounded-md flex items-center gap-0.5 ${item.isCriticalCarryover || item.carryoverTag.includes('▲')
                      ? 'bg-status-critical-bg text-status-critical'
                      : item.carryoverTag === 'Baru'
                        ? 'bg-secondary-container text-on-secondary-fixed'
                        : 'bg-surface-container text-text-secondary'
                      }`}
                  >
                    {item.carryoverTag}
                  </span>

                  {/* Duration Badge */}
                  <span className="text-[10.5px] font-semibold text-text-muted bg-surface-elevated px-2 py-0.5 rounded border border-border-subtle/50">
                    {item.duration}
                  </span>

                  {/* Due Date */}
                  <span className="text-[11px] font-medium text-text-muted flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-text-muted shrink-0" />
                    <span>{item.dueDate}</span>
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
