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
  const formatNum = (n: number) => String(n).padStart(2, '0');

  return (
    <section className="bg-surface-elevated rounded-2xl p-unit-md shadow-sm flex flex-col gap-unit-sm shrink-0 border border-border-subtle">
      <div className="flex items-center justify-between h-6 shrink-0">
        <div className="flex items-center gap-unit-xs">
          <span className="material-symbols-outlined text-sage-medium text-base">stacked_bar_chart</span>
          <span className="text-[10.5px] font-bold text-text-muted uppercase tracking-wider">
            Total Overview • GTD State
          </span>
        </div>
        <button
          className="flex items-center gap-unit-2xs px-unit-sm py-0.5 bg-surface-container-low hover:bg-surface-container rounded-lg text-[12px] font-semibold text-text-secondary transition-all"
          type="button"
        >
          <span>Hari Ini</span>
          <span className="material-symbols-outlined text-sm">keyboard_arrow_down</span>
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-unit-sm">
        {/* Stat 1: Open Actions */}
        <div className="bg-surface-container-low hover:bg-surface-container-high/60 transition-all rounded-xl p-unit-md flex items-center gap-unit-md shadow-sm border border-border-subtle/50">
          <div className="w-9 h-9 rounded-xl bg-type-action-bg text-type-action flex items-center justify-center shrink-0 shadow-2xs">
            <span className="material-symbols-outlined text-lg">tune</span>
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Open Actions</span>
            <span className="text-[18px] font-bold text-forest-dark tracking-tight leading-tight">
              {formatNum(actionCount)} Items
            </span>
          </div>
        </div>

        {/* Stat 2: Waiting Others */}
        <div className="bg-surface-container-low hover:bg-surface-container-high/60 transition-all rounded-xl p-unit-md flex items-center gap-unit-md shadow-sm border border-border-subtle/50">
          <div className="w-9 h-9 rounded-xl bg-type-waiting-bg text-type-waiting flex items-center justify-center shrink-0 shadow-2xs">
            <span className="material-symbols-outlined text-lg">hourglass_top</span>
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Waiting Others</span>
            <span className="text-[18px] font-bold text-forest-dark tracking-tight leading-tight">
              {formatNum(waitingCount)} Items
            </span>
          </div>
        </div>

        {/* Stat 3: Questions > 7D */}
        <div className="bg-surface-container-low hover:bg-status-critical-bg/30 transition-all rounded-xl p-unit-md flex items-center gap-unit-md shadow-sm border border-border-subtle/50">
          <div className="w-9 h-9 rounded-xl bg-status-critical-bg text-status-critical flex items-center justify-center shrink-0 shadow-2xs">
            <span className="material-symbols-outlined text-lg">warning</span>
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-[10px] font-bold text-status-critical uppercase tracking-wider">Questions &gt; 7D</span>
            <span className="text-[18px] font-bold text-status-critical tracking-tight leading-tight">
              {formatNum(criticalQuestionsCount)} Kritis
            </span>
          </div>
        </div>

        {/* Stat 4: Top 5 Streak */}
        <div className="bg-surface-container-low hover:bg-surface-container-high/60 transition-all rounded-xl p-unit-md flex items-center gap-unit-md shadow-sm border border-border-subtle/50">
          <div className="w-9 h-9 rounded-xl bg-secondary-container text-on-secondary-fixed flex items-center justify-center shrink-0 shadow-2xs">
            <span className="material-symbols-outlined text-lg">verified</span>
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Top 5 Streak</span>
            <span className="text-[18px] font-bold text-forest-dark tracking-tight leading-tight flex items-center gap-1">
              <span>{top5StreakDays}d Sukses</span>
              <span className="text-sm">🔥</span>
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
