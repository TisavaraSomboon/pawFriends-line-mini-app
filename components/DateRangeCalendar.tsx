"use client";
import { useState } from "react";
import Image from "next/image";
import dayjs from "dayjs";
import { clsx } from "clsx";

type AttendeeAvatar = { image: string; name: string };

type Slot = {
  _id: string;
  weekday: number;   // 0=Mon … 6=Sun
  startTime: string; // "HH:mm"
  endTime: string;   // "HH:mm"
  maxDogs?: number;
  attendeesId?: string[];
  label?: string;
};

type Props = {
  startDate: string; // "YYYY-MM-DDTHH:mm"
  endDate: string;   // "YYYY-MM-DDTHH:mm"
  onStartChange: (v: string) => void;
  onEndChange: (v: string) => void;
  label?: string;
  isSingleDate?: boolean;
  // read-only attendance view
  attendeesByDate?: Record<string, AttendeeAvatar[]>;
  onDayClick?: (dateKey: string) => void;
  readOnly?: boolean;
  slots?: Slot[];
  onSlotChange?: (slotId: string | null) => void;
};

export default function DateRangeCalendar({
  startDate,
  endDate,
  onStartChange,
  onEndChange,
  label = "Date & Time",
  isSingleDate = false,
  attendeesByDate,
  onDayClick,
  readOnly = false,
  slots,
  onSlotChange,
}: Props) {
  const [month, setMonth] = useState(dayjs().startOf("month"));
  const [selectingEnd, setSelectingEnd] = useState(false);
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null);
  const changeSlot = (id: string | null) => { setSelectedSlotId(id); onSlotChange?.(id); };
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
    changeSlot(null);
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
      {label && (
        <label className="text-[13px] font-semibold text-[#334155] mb-2 block ml-1">
          {label} {!readOnly && <span className="text-red-400">*</span>}
        </label>
      )}
      <div className="bg-white rounded-[14px] border border-[rgba(226,207,183,0.4)] overflow-hidden">
        {/* Month nav */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-[rgba(226,207,183,0.3)]">
          <button
            type="button"
            onClick={() => setMonth((m) => m.subtract(1, "month"))}
            disabled={!readOnly && month.isSame(dayjs().startOf("month"), "month")}
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
        {!isSingleDate && !readOnly && (
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
          {(() => {
            const availableWeekdays = slots && slots.length > 0
              ? new Set(slots.map((s) => s.weekday))
              : null;
            return cells.map((day, i) => {
            if (!day) return <div key={`e-${i}`} />;
            const dateKey = day.format("YYYY-MM-DD");
            const isPast = day.isBefore(today);
            const isClosed = !readOnly && !!availableWeekdays && !availableWeekdays.has((day.day() + 6) % 7);
            const isStart = dateKey === startDay;
            const isEnd = dateKey === endDay;
            const isInRange =
              !isSingleDate && !!startDay && !!endDay && dateKey > startDay && dateKey < endDay;
            const isSelected = isSingleDate ? isStart : isStart || isEnd;
            const isToday = day.isSame(today, "day");

            const dateAttendees = attendeesByDate?.[dateKey] ?? [];
            const hasAttendees = dateAttendees.length > 0;
            // In readOnly: past days with attendees are still clickable; past days without are not
            const isReadOnlyDisabled = readOnly && isPast && !hasAttendees;

            return (
              <button
                key={dateKey}
                type="button"
                disabled={readOnly ? isReadOnlyDisabled : isPast || isClosed}
                onClick={() => {
                  if (readOnly) {
                    if (hasAttendees) onDayClick?.(dateKey);
                  } else {
                    handleDayClick(dateKey);
                  }
                }}
                className={clsx(
                  "flex flex-col items-center justify-center rounded-xl gap-0.5 transition-all",
                  readOnly ? "h-14" : "h-10",
                  !readOnly && (isPast || isClosed) && "opacity-30 cursor-not-allowed",
                  !readOnly && isSelected && !isClosed && "bg-[#1e293b]",
                  !readOnly && isInRange && !isSelected && !isClosed && "bg-[rgba(226,207,183,0.35)]",
                  !readOnly && !isSelected && !isInRange && !isPast && !isClosed && "hover:bg-[rgba(226,207,183,0.15)]",
                  readOnly && isPast && !hasAttendees && "opacity-30 cursor-not-allowed",
                  readOnly && hasAttendees && "hover:bg-[rgba(226,207,183,0.15)] cursor-pointer",
                  readOnly && !hasAttendees && !isPast && "cursor-default",
                  readOnly && isToday && "ring-1 ring-[rgba(226,207,183,0.6)] rounded-xl",
                )}
              >
                <p
                  className={clsx(
                    "text-[13px] font-bold leading-none",
                    !readOnly && isSelected && !isClosed ? "text-white" : "text-[#1e293b]",
                    readOnly && isToday && !hasAttendees && "text-[#e2cfb7]",
                  )}
                >
                  {day.date()}
                </p>

                {hasAttendees ? (
                  <div className="flex -space-x-1 mt-0.5">
                    {dateAttendees.slice(0, 2).map((a, idx) => (
                      <div
                        key={idx}
                        className="w-4 h-4 rounded-full border border-white overflow-hidden bg-[#e2cfb7] shrink-0"
                      >
                        {a.image ? (
                          <Image
                            src={a.image}
                            alt={a.name}
                            width={16}
                            height={16}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <span className="text-[6px] font-bold text-[#1e293b]">
                              {a.name?.[0]?.toUpperCase() ?? "?"}
                            </span>
                          </div>
                        )}
                      </div>
                    ))}
                    {dateAttendees.length > 2 && (
                      <div className="w-4 h-4 rounded-full bg-[#1e293b] flex items-center justify-center border border-white shrink-0">
                        <span className="text-[7px] font-bold text-white">
                          +{dateAttendees.length - 2}
                        </span>
                      </div>
                    )}
                  </div>
                ) : readOnly ? (
                  <div className="h-4" />
                ) : (
                  <div className="text-[9px] font-bold text-[#e2cfb7] leading-none">
                    {!isSingleDate && isSelected
                      ? isStart && isEnd ? "S/E" : isStart ? "S" : "E"
                      : " "}
                  </div>
                )}
              </button>
            );
          });
          })()}
        </div>

        {/* Time inputs — hidden in readOnly mode */}
        {!readOnly && (() => {
          const slotsForDay = slots && startDay
            ? slots.filter((s) => s.weekday === (dayjs(startDay).day() + 6) % 7)
            : [];
          const selectedSlot = slotsForDay.find((s) => s._id === selectedSlotId) ?? null;
          return (
            <div className="border-t border-[rgba(226,207,183,0.3)] px-4 py-3 flex flex-col gap-3">
              {/* Slot picker */}
              {slotsForDay.length > 0 && (
                <div>
                  <p className="text-[10px] font-bold text-[#94a3b8] uppercase tracking-wide mb-1.5">
                    Available Slots
                  </p>
                  <div className="flex flex-col gap-2">
                    {slotsForDay.map((slot) => {
                      const isFull = !!slot.maxDogs && (slot.attendeesId?.length ?? 0) >= slot.maxDogs;
                      return (
                        <button
                          key={slot._id}
                          type="button"
                          disabled={isFull}
                          onClick={() => {
                            changeSlot(slot._id);
                            const day = startDay;
                            onStartChange(`${day}T${slot.startTime}`);
                            onEndChange(`${isSingleDate ? day : (endDay || day)}T${slot.endTime}`);
                          }}
                          className={clsx(
                            "px-3 py-2 rounded-lg text-[12px] font-semibold border transition-all text-left",
                            isFull
                              ? "bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed"
                              : selectedSlotId === slot._id
                                ? "bg-[#1e293b] text-white border-[#1e293b]"
                                : "bg-white text-[#1e293b] border-[rgba(226,207,183,0.6)] hover:border-[#1e293b]",
                          )}
                        >
                          {slot.label && (
                            <span className="block text-[11px] font-bold mb-0.5 opacity-70">{slot.label}</span>
                          )}
                          <span className={clsx(isFull && "line-through")}>
                            {slot.startTime} – {slot.endTime}
                          </span>
                          {isFull && <span className="ml-1 text-[10px]">Full</span>}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
              <div className={clsx("grid gap-3", isSingleDate ? "grid-cols-1" : "grid-cols-2")}>
                <div>
                  <p className="text-[10px] font-bold text-[#94a3b8] uppercase tracking-wide mb-1.5">
                    {isSingleDate ? "Time" : "Start Time"}
                  </p>
                  <input
                    type="time"
                    value={startTime}
                    min={selectedSlot?.startTime}
                    max={selectedSlot?.endTime}
                    onChange={(e) => {
                      let val = e.target.value;
                      if (selectedSlot) {
                        if (val < selectedSlot.startTime) val = selectedSlot.startTime;
                        if (val > selectedSlot.endTime) val = selectedSlot.endTime;
                      }
                      const day = startDay || dayjs().format("YYYY-MM-DD");
                      onStartChange(`${day}T${val}`);
                      if (isSingleDate) onEndChange(`${day}T${val}`);
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
                      min={selectedSlot?.startTime}
                      max={selectedSlot?.endTime}
                      onChange={(e) => {
                        let val = e.target.value;
                        if (selectedSlot) {
                          if (val < selectedSlot.startTime) val = selectedSlot.startTime;
                          if (val > selectedSlot.endTime) val = selectedSlot.endTime;
                        }
                        onEndChange(`${endDay || startDay || dayjs().format("YYYY-MM-DD")}T${val}`);
                      }}
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
          );
        })()}
      </div>
    </div>
  );
}
