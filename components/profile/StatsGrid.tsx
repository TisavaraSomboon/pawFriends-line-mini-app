"use client";

export default function StatsGrid({
  stats,
  compact = false,
}: {
  stats: { label: string; value: number | string }[];
  compact?: boolean;
}) {
  return (
    <div className="grid grid-cols-4 gap-2 w-full my-4">
      {stats.map((s) => (
        <div
          key={s.label}
          className={`bg-white rounded-xl border border-[rgba(226,207,183,0.3)] flex flex-col items-center shadow-sm ${compact ? "py-2.5 px-1" : "p-3"}`}
        >
          <span
            className={`font-bold text-[#1e293b] ${compact ? "text-[13px]" : "text-[15px]"}`}
          >
            {s.value}
          </span>
          <span
            className={`uppercase tracking-wider text-[#64748b] font-semibold mt-0.5 ${compact ? "text-[8px]" : "text-[9px]"}`}
          >
            {s.label}
          </span>
        </div>
      ))}
    </div>
  );
}
