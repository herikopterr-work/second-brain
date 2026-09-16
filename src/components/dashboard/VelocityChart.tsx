'use client';

export interface DayVelocity {
  day: string;
  selesai: number;
  active: number;
  badge?: string;
  isPeak?: boolean;
}

interface VelocityChartProps {
  initialData?: DayVelocity[];
}

export default function VelocityChart({ initialData }: VelocityChartProps) {
  const weekData: DayVelocity[] = initialData && initialData.length > 0 ? initialData : [
    { day: 'M', selesai: 16, active: 14 },
    { day: 'T', selesai: 12, active: 9 },
    { day: 'W', selesai: 10, active: 7 },
    { day: 'T', selesai: 16, active: 20, badge: '85% Vel', isPeak: true },
    { day: 'F', selesai: 14, active: 12 },
    { day: 'S', selesai: 8, active: 6 },
    { day: 'S', selesai: 7, active: 5 },
  ];

  const maxVal = 40; // Max combined total for scaling

  return (
    <div className="bg-surface-elevated rounded-2xl p-unit-lg shadow-sm flex flex-col justify-between gap-unit-sm border border-border-subtle h-full">
      {/* Header with Title & Legend */}
      <div className="flex items-center justify-between gap-unit-sm h-7 shrink-0">
        <div className="flex items-center gap-unit-xs">
          <span className="material-symbols-outlined text-sage-medium text-base">bar_chart</span>
          <span className="text-[13px] font-semibold text-forest-dark uppercase tracking-wider">
            Weekly GTD Velocity &amp; Completion
          </span>
        </div>

        <div className="flex items-center gap-unit-md">
          <div className="flex items-center gap-unit-sm">
            <span className="flex items-center gap-1.5 text-[11.5px] text-text-secondary">
              <span className="w-2 h-2 rounded-full bg-sage-soft"></span> Selesai
            </span>
            <span className="flex items-center gap-1.5 text-[11.5px] text-text-secondary">
              <span className="w-2 h-2 rounded-full bg-primary-container"></span> Active
            </span>
          </div>

          <button
            className="flex items-center gap-unit-2xs px-unit-sm py-0.5 bg-surface-container-low hover:bg-surface-container rounded-lg text-[12px] font-semibold text-text-secondary transition-colors"
            type="button"
          >
            <span>Minggu Ini</span>
            <span className="material-symbols-outlined text-xs">keyboard_arrow_down</span>
          </button>
        </div>
      </div>

      {/* Custom Stacked Bar Chart */}
      <div className="relative pt-5 pb-2 flex-1 min-h-0 flex flex-col justify-end">
        <div className="flex items-end justify-between gap-2 flex-1 min-h-[190px] px-2">
          {/* Y-Axis scale */}
          <div className="flex flex-col justify-between h-full text-[10.5px] font-bold text-text-muted pr-2.5 py-1.5">
            <span>20</span>
            <span>15</span>
            <span>10</span>
            <span>5</span>
            <span>0</span>
          </div>

          {/* Columns for days */}
          {weekData.map((item, idx) => {
            const activePercent = Math.min((item.active / maxVal) * 100, 48);
            const selesaiPercent = Math.min((item.selesai / maxVal) * 100, 42);

            return (
              <div
                key={idx}
                className={`flex-1 flex flex-col items-center gap-1.5 h-full justify-end relative ${
                  item.isPeak ? 'z-10' : ''
                }`}
              >
                {/* Floating Highlight Badge */}
                {item.badge && (
                  <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-forest-dark text-on-primary text-[10px] font-bold px-2 py-0.5 rounded-md shadow-md flex items-center gap-1 whitespace-nowrap z-20">
                    <span>{item.badge}</span>
                  </div>
                )}

                {/* Peak background pill */}
                {item.isPeak && (
                  <div className="absolute inset-0 bg-surface-container/60 rounded-xl -z-10 -mx-1" />
                )}

                <div className="w-full max-w-[36px] flex flex-col items-center rounded-xl overflow-hidden bg-transparent h-[76%] justify-end pb-1">
                  {/* Top bar: Active */}
                  <div
                    style={{ height: `${activePercent * 1.7}%` }}
                    className="w-full bg-primary-container rounded-t-lg transition-all hover:opacity-90 min-h-[6px]"
                    title={`Active: ${item.active}`}
                  />
                  {/* Bottom bar: Selesai */}
                  <div
                    style={{ height: `${selesaiPercent * 1.7}%` }}
                    className="w-full bg-sage-soft rounded-b-lg transition-all hover:opacity-90 min-h-[6px]"
                    title={`Selesai: ${item.selesai}`}
                  />
                </div>

                <span
                  className={`text-[12px] shrink-0 ${
                    item.isPeak
                      ? 'text-forest-dark font-bold'
                      : 'text-text-muted font-semibold'
                  }`}
                >
                  {item.day}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
