'use client';

interface DayVelocity {
  day: string;
  selesai: number;
  active: number;
  badge?: string;
}

const WEEK_DATA: DayVelocity[] = [
  { day: 'M', selesai: 10, active: 7 },
  { day: 'T', selesai: 8, active: 5 },
  { day: 'W', selesai: 7, active: 4 },
  { day: 'T', selesai: 10, active: 10, badge: '85% Vel' },
  { day: 'F', selesai: 9, active: 6 },
  { day: 'S', selesai: 5, active: 3 },
  { day: 'S', selesai: 4, active: 4 },
];

export default function VelocityChart() {
  const maxVal = 20;

  return (
    <div className="bg-white border border-[#DFE6DC] rounded-3xl p-6 shadow-sm space-y-6">
      {/* Header with Title & Legend */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="text-sm text-[#162B20]">📊</span>
          <h3 className="font-bold text-xs uppercase tracking-wider text-[#19241C]">
            WEEKLY GTD VELOCITY & COMPLETION
          </h3>
        </div>

        <div className="flex items-center gap-4 text-xs text-[#58655B]">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#8BA888]" />
            <span className="text-[11px] font-medium">Selesai</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#162B20]" />
            <span className="text-[11px] font-medium">Active</span>
          </div>

          <button className="px-2.5 py-1 rounded-lg bg-[#F6F8F5] border border-[#DFE6DC] text-[11px] font-semibold text-[#19241C] flex items-center gap-1 hover:bg-white transition-colors">
            <span>Minggu Ini</span>
            <span className="text-[9px] text-[#8A978E]">⌄</span>
          </button>
        </div>
      </div>

      {/* Bar Chart Area */}
      <div className="relative pt-6">
        <div className="flex items-end justify-between gap-2 h-44 px-2">
          {/* Y Axis Labels */}
          <div className="flex flex-col justify-between h-full text-[10px] font-mono text-[#8A978E] pb-6 shrink-0">
            <span>20</span>
            <span>15</span>
            <span>10</span>
            <span>5</span>
            <span>0</span>
          </div>

          {/* Day Bars */}
          <div className="flex-1 flex items-end justify-around h-full border-b border-[#DFE6DC] pb-1 gap-2">
            {WEEK_DATA.map((item, idx) => {
              const total = item.selesai + item.active;
              const heightPercent = Math.min((total / maxVal) * 100, 100);
              const selesaiRatio = (item.selesai / total) * 100;
              const activeRatio = (item.active / total) * 100;

              return (
                <div key={idx} className="flex-1 flex flex-col items-center gap-2 group relative">
                  {/* Tooltip Badge */}
                  {item.badge && (
                    <div className="absolute -top-7 px-2 py-0.5 rounded-md bg-[#162B20] text-white text-[10px] font-mono font-bold shadow-md animate-bounce">
                      {item.badge}
                    </div>
                  )}

                  {/* Stacked Bar */}
                  <div
                    style={{ height: `${heightPercent}%` }}
                    className="w-full max-w-[28px] rounded-lg overflow-hidden flex flex-col-reverse transition-all group-hover:opacity-90 shadow-2xs"
                  >
                    {/* Bottom: Selesai */}
                    <div
                      style={{ height: `${selesaiRatio}%` }}
                      className="w-full bg-[#8BA888] transition-all"
                    />
                    {/* Top: Active */}
                    <div
                      style={{ height: `${activeRatio}%` }}
                      className="w-full bg-[#162B20] transition-all"
                    />
                  </div>

                  {/* X Axis Day Label */}
                  <span className="text-[11px] font-bold text-[#58655B] font-mono">
                    {item.day}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
