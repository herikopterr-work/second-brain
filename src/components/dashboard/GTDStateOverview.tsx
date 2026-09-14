'use client';

interface GTDStateProps {
  actionCount?: number;
  waitingCount?: number;
  criticalQuestionsCount?: number;
  top5StreakDays?: number;
}

export default function GTDStateOverview({
  actionCount = 14,
  waitingCount = 5,
  criticalQuestionsCount = 2,
  top5StreakDays = 5,
}: GTDStateProps) {
  return (
    <div className="space-y-3">
      {/* Header Row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xs text-[#58655B]">📊</span>
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#58655B]">
            TOTAL OVERVIEW • GTD STATE
          </span>
        </div>

        <button className="px-2.5 py-1 rounded-lg bg-white border border-[#DFE6DC] text-xs font-semibold text-[#19241C] flex items-center gap-1.5 shadow-2xs hover:bg-[#F6F8F5]">
          <span>Hari Ini</span>
          <span className="text-[10px] text-[#8A978E]">⌄</span>
        </button>
      </div>

      {/* 4 Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* 1. Open Actions */}
        <div className="bg-white border border-[#DFE6DC] rounded-2xl p-4 shadow-sm flex items-center gap-3.5 hover:border-[#CBD5C8] transition-all">
          <div className="w-11 h-11 rounded-xl bg-[#EBF4EE] text-[#2A5C43] flex items-center justify-center text-lg shrink-0">
            📑
          </div>
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-[#8A978E]">
              OPEN ACTIONS
            </div>
            <div className="text-xl font-extrabold text-[#19241C] font-mono tracking-tight">
              {String(actionCount).padStart(2, '0')}{' '}
              <span className="text-xs font-semibold font-sans text-[#58655B]">Items</span>
            </div>
          </div>
        </div>

        {/* 2. Waiting Others */}
        <div className="bg-white border border-[#DFE6DC] rounded-2xl p-4 shadow-sm flex items-center gap-3.5 hover:border-[#CBD5C8] transition-all">
          <div className="w-11 h-11 rounded-xl bg-[#FEF3C7] text-[#B45309] flex items-center justify-center text-lg shrink-0">
            ⏳
          </div>
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-[#8A978E]">
              WAITING OTHERS
            </div>
            <div className="text-xl font-extrabold text-[#19241C] font-mono tracking-tight">
              {String(waitingCount).padStart(2, '0')}{' '}
              <span className="text-xs font-semibold font-sans text-[#58655B]">Items</span>
            </div>
          </div>
        </div>

        {/* 3. Questions > 7D */}
        <div className="bg-white border border-[#DFE6DC] rounded-2xl p-4 shadow-sm flex items-center gap-3.5 hover:border-[#CBD5C8] transition-all">
          <div className="w-11 h-11 rounded-xl bg-[#FEE2E2] text-[#DC2626] flex items-center justify-center text-lg shrink-0">
            ⚠️
          </div>
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-[#DC2626]">
              QUESTIONS &gt; 7D
            </div>
            <div className="text-xl font-extrabold text-[#DC2626] font-mono tracking-tight">
              {String(criticalQuestionsCount).padStart(2, '0')}{' '}
              <span className="text-xs font-bold font-sans">Kritis</span>
            </div>
          </div>
        </div>

        {/* 4. Top 5 Streak */}
        <div className="bg-white border border-[#DFE6DC] rounded-2xl p-4 shadow-sm flex items-center gap-3.5 hover:border-[#CBD5C8] transition-all">
          <div className="w-11 h-11 rounded-xl bg-[#EBF4EE] text-[#2A5C43] flex items-center justify-center text-lg shrink-0">
            🛡️
          </div>
          <div className="flex-1">
            <div className="text-[10px] font-bold uppercase tracking-wider text-[#8A978E]">
              TOP 5 STREAK
            </div>
            <div className="text-xl font-extrabold text-[#19241C] font-mono tracking-tight flex items-center justify-between">
              <span>{top5StreakDays}d <span className="text-xs font-semibold font-sans text-[#2A5C43]">Sukses</span></span>
              <span className="text-base">🔥</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
