"use client";
import { useState } from "react";
import dayjs from "dayjs";
import { clsx } from "clsx";

type Props = {
  startDate: string; // "YYYY-MM-DDTHH:mm"
  endDate: string;   // "YYYY-MM-DDTHH:mm"
  onStartChange: (v: string) => void;
  onEndChange: (v: string) => void;
  label?: string;
  isSingleDate?: boolean;
};

export default function DateRangeCalendar({
  startDate,
  endDate,
  onStartChange,
  onEndChange,
  label = "Date & Time",
  isSingleDate = false,
}: Props) {
  const [month, setMonth] = useState(dayjs().startOf("month"));
  const [selectingEnd, setSelectingEnd] = useState(false);
  const today = dayjs().startOf("day");

  const startDay = startDate ? startDate.split("T")[0] : "";
  const endDay = endDate ? endDate.split("T")[0] : "";
  const startTime = startDate?.split("T")[1] || "09:00";
  const endTime = endDate?.split("T")[1] || "18:00";

  const startOfMonth = month.startOf("month");
  const daysInMonth = month.daysInMonth();
  const firstDayOffset = (startOfMonth.day() + 6) % 7;
  const cells: (dayjs.Dayjs | null)[] = [
    ...Array<null>(firstDayOffset).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => startOfMonth.add(i, "day")),
  ];

  const handleDayClick = (dateKey: string) => {
    if (isSingleDate) {
      onStartChange(`${dateKey}T${startTime}`);
      onEndChange(`${dateKey}T${endTime}`);
      return;
    }
    if (!selectingEnd) {
      onStartChange(`${dateKey}T${startTime}`);
      if (endDay && endDay < dateKey) {
        onEndChange(`${dateKey}T${endTime}`);
      }
      setSelectingEnd(true);
    } else {
      if (dateKey < startDay) {
        onStartChange(`${dateKey}T${startTime}`);
        onEndChange(`${dateKey}T${endTime}`);
      } else {
        onEndChange(`${dateKey}T${endTime}`);
      }
      setSelectingEnd(false);
    }
  };

  return (
    <div>
      <label className="text-[13px] font-semibold text-[#334155] mb-2 block ml-1">
        {label} <span className="text-red-400">*</span>
      </label>
      <div className="bg-white rounded-[14px] border border-[rgba(226,207,183,0.4)] overflow-hidden">
        {/* Month nav */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-[rgba(226,207,183,0.3)]">
          <button
            type="button"
            onClick={() => setMonth((m) => m.subtract(1, "month"))}
            disabled={month.isSame(dayjs().startOf("month"), "month")}
            className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-[rgba(226,207,183,0.2)] disabled:opacity-30 transition-colors"
          >
            <span className="material-symbols-outlined text-[#1e293b]" style={{ fontSize: 18 }}>
              chevron_left
            </span>
          </button>
          <p className="text-[14px] font-bold text-[#1e293b]">
            {month.format("MMMM YYYY")}
          </p>
          <button
            type="button"
            onClick={() => setMonth((m) => m.add(1, "month"))}
            className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-[rgba(226,207,183,0.2)] transition-colors"
          >
            <span className="material-symbols-outlined text-[#1e293b]" style={{ fontSize: 18 }}>
              chevron_right
            </span>
          </button>
        </div>

        {/* Selection hint */}
        {!isSingleDate && (
          <p className="text-[11px] text-[#94a3b8] text-center pt-2">
            {selectingEnd ? "Tap to set end date" : "Tap to set start date"}
          </p>
        )}

        {/* Weekday headers */}
        <div className="grid grid-cols-7 text-center px-2 pt-2">
          {["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"].map((d) => (
            <p key={d} className="text-[10px] font-bold text-[#94a3b8] py-1">
              {d}
            </p>
          ))}
        </div>

        {/* Day cells */}
        <div className="grid grid-cols-7 gap-0.5 px-2 pb-3">
          {cells.map((day, i) => {
            if (!day) return <div key={`e-${i}`} />;
            const dateKey = day.format("YYYY-MM-DD");
            const isPast = day.isBefore(today);
            const isStart = dateKey === startDay;
            const isEnd = dateKey === endDay;
            const isInRange =
              !isSingleDate && !!startDay && !!endDay && dateKey > startDay && dateKey < endDay;
            const isSelected = isSingleDate ? isStart : isStart || isEnd;

            return (
              <button
                key={dateKey}
                type="button"
                disabled={isPast}
                onClick={() => handleDayClick(dateKey)}
                className={clsx(
                  "flex flex-col items-center justify-center rounded-xl h-10 gap-0.5 transition-all",
                  isPast && "opacity-30 cursor-not-allowed",
                  isSelected && "bg-[#1e293b]",
                  isInRange && !isSelected && "bg-[rgba(226,207,183,0.35)]",
                  !isSelected && !isInRange && !isPast && "hover:bg-[rgba(226,207,183,0.15)]",
                )}
              >
                <p
                  className={clsx(
                    "text-[13px] font-bold leading-none",
                    isSelected ? "text-white" : "text-[#1e293b]",
                  )}
                >
                  {day.date()}
                </p>
                <div className="text-[9px] font-bold text-[#e2cfb7] leading-none">
                  {!isSingleDate && isSelected
                    ? (isStart && isEnd ? "S/E" : isStart ? "S" : "E")
                    : " "}
                </div>
              </button>
            );
          })}
        </div>

        {/* Time inputs */}
        <div className="border-t border-[rgba(226,207,183,0.3)] px-4 py-3 flex flex-col gap-3">
          <div className={clsx("grid gap-3", isSingleDate ? "grid-cols-1" : "grid-cols-2")}>
            <div>
              <p className="text-[10px] font-bold text-[#94a3b8] uppercase tracking-wide mb-1.5">
                {isSingleDate ? "Time" : "Start Time"}
              </p>
              <input
                type="time"
                value={startTime}
                onChange={(e) => {
                  const day = startDay || dayjs().format("YYYY-MM-DD");
                  onStartChange(`${day}T${e.target.value}`);
                  if (isSingleDate) onEndChange(`${day}T${e.target.value}`);
                }}
                className="w-full h-10 rounded-lg border border-[rgba(226,207,183,0.4)] bg-white px-3 text-[13px] text-[#1e293b] outline-none focus:border-[#e1cfb7]"
              />
            </div>
            {!isSingleDate && (
              <div>
                <p className="text-[10px] font-bold text-[#94a3b8] uppercase tracking-wide mb-1.5">
                  End Time
                </p>
                <input
                  type="time"
                  value={endTime}
                  onChange={(e) =>
                    onEndChange(`${endDay || startDay || dayjs().format("YYYY-MM-DD")}T${e.target.value}`)
                  }
                  className="w-full h-10 rounded-lg border border-[rgba(226,207,183,0.4)] bg-white px-3 text-[13px] text-[#1e293b] outline-none focus:border-[#e1cfb7]"
                />
              </div>
            )}
          </div>
          {startDay && (isSingleDate || endDay) && (
            <div className="flex items-center justify-between text-[12px] font-semibold text-[#64748b] bg-[#f8fafc] rounded-lg px-3 py-2">
              <span>{dayjs(startDay).format("D MMM")} · {startTime}</span>
              {!isSingleDate && (
                <>
                  <span
                    className="material-symbols-outlined text-[#94a3b8]"
                    style={{ fontSize: 14 }}
                  >
                    arrow_forward
                  </span>
                  <span>{dayjs(endDay).format("D MMM")} · {endTime}</span>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
