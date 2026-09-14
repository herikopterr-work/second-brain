'use client';

import { useState } from 'react';

interface WinningItem {
  id: string;
  title: string;
  carryoverTag: string;
  isCriticalCarryover?: boolean;
  duration: string;
  dueDate: string;
  completed: boolean;
}

const INITIAL_WINNINGS: WinningItem[] = [
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
    duration: '45m',
    dueDate: 'Aug 04',
    completed: false,
  },
  {
    id: 'w-3',
    title: 'Draft dokumen RFC otentikasi biometric multi-tenant',
    carryoverTag: 'Hari ke-2',
    duration: '60m',
    dueDate: 'Aug 04',
    completed: false,
  },
  {
    id: 'w-4',
    title: 'Sinkronisasi ekspektasi roadmap Q4 dengan Product Management',
    carryoverTag: 'Hari ke-1',
    duration: '30m',
    dueDate: 'Aug 04',
    completed: false,
  },
  {
    id: 'w-5',
    title: 'Verifikasi checklist audit kepatuhan ISO 27001',
    carryoverTag: 'Baru',
    duration: '45m',
    dueDate: 'Aug 04',
    completed: false,
  },
];

export default function TodaysWinning() {
  const [items, setItems] = useState<WinningItem[]>(INITIAL_WINNINGS);

  const toggleCheck = (id: string) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, completed: !item.completed } : item
      )
    );
  };

  return (
    <div className="bg-white border border-[#DFE6DC] rounded-3xl p-6 shadow-sm space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm text-[#2A5C43]">🛡️</span>
          <h3 className="font-bold text-xs uppercase tracking-wider text-[#19241C]">
            Top 5: Today's Winning
          </h3>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 rounded-lg bg-[#EBF4EE] text-[#2A5C43] text-[11px] font-semibold border border-[#CBD5C8]/60 flex items-center gap-1">
            <span>🔒</span>
            <span>Terkunci Hari Ini</span>
          </span>
          <button className="px-2.5 py-1 rounded-lg bg-[#F6F8F5] hover:bg-[#EFF3ED] text-[#19241C] text-[11px] font-bold border border-[#DFE6DC] transition-colors">
            + Add
          </button>
        </div>
      </div>

      {/* Stack Items */}
      <div className="space-y-2.5">
        {items.map((item) => (
          <div
            key={item.id}
            onClick={() => toggleCheck(item.id)}
            className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
              item.completed
                ? 'bg-[#F6F8F5] border-[#DFE6DC] opacity-60'
                : 'bg-[#F6F8F5]/80 hover:bg-[#F6F8F5] border-[#DFE6DC] hover:border-[#CBD5C8]'
            }`}
          >
            {/* Left Checkbox & Title */}
            <div className="flex items-center gap-3 min-w-0">
              {/* Circular Custom Checkbox */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleCheck(item.id);
                }}
                className={`w-5 h-5 rounded-full border flex items-center justify-center transition-all shrink-0 ${
                  item.completed
                    ? 'bg-[#1E3B2B] border-[#1E3B2B] text-white text-[10px]'
                    : 'border-[#8BA888] bg-white hover:border-[#2A5C43]'
                }`}
              >
                {item.completed && '✓'}
              </button>

              <div className="min-w-0">
                <p
                  className={`text-xs font-semibold leading-tight truncate ${
                    item.completed
                      ? 'line-through text-[#8A978E]'
                      : 'text-[#19241C]'
                  }`}
                >
                  {item.title}
                </p>

                {/* Metadata badges row */}
                <div className="flex items-center gap-2 mt-1.5 text-[10px]">
                  {/* Carryover Badge */}
                  <span
                    className={`px-1.5 py-0.5 rounded font-bold font-mono ${
                      item.isCriticalCarryover
                        ? 'bg-[#FEE2E2] text-[#DC2626] border border-[#FECACA]'
                        : item.carryoverTag === 'Baru'
                        ? 'bg-[#EBF4EE] text-[#2A5C43] border border-[#D1E7DD]'
                        : 'bg-white text-[#58655B] border border-[#DFE6DC]'
                    }`}
                  >
                    {item.carryoverTag}
                  </span>

                  {/* Duration */}
                  <span className="text-[#8A978E] font-mono">{item.duration}</span>

                  {/* Due Date */}
                  <span className="text-[#8A978E] flex items-center gap-1 font-mono">
                    <span>📅</span>
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
