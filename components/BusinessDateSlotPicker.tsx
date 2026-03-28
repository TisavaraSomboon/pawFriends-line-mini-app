"use client";
import { useState } from "react";
import { clsx } from "clsx";

export type TimeSlot = {
  id: string;
  label: string;
  startTime: string;
  endTime: string;
  maxDogs: number;
};

export type WeekdaySlots = Record<number, TimeSlot[]>; // 0=Mon … 6=Sun

const WEEK_DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

type Props = {
  weekdaySlots: WeekdaySlots;
  onChange: (slots: WeekdaySlots) => void;
};

export default function BusinessDateSlotPicker({ weekdaySlots, onChange }: Props) {
  const [openDays, setOpenDays] = useState<number[]>([]);
  const [activeDay, setActiveDay] = useState<number | null>(null);

  const handleDayClick = (i: number) => {
    if (!openDays.includes(i)) {
      // Select new day
      setOpenDays((prev) => [...prev, i]);
      setActiveDay(i);
    } else if (activeDay === i) {
      // Deselect active day
      setOpenDays((prev) => prev.filter((d) => d !== i));
      setActiveDay(null);
    } else {
      // Focus another already-open day
      setActiveDay(i);
    }
  };

  const handleAddSlot = (slot: Omit<TimeSlot, "id">) => {
    if (activeDay === null) return;
    const id = `${activeDay}-${Date.now()}`;
    onChange({
      ...weekdaySlots,
      [activeDay]: [...(weekdaySlots[activeDay] ?? []), { ...slot, id }],
    });
  };

  const handleRemoveSlot = (slotId: string) => {
    if (activeDay === null) return;
    const updated = (weekdaySlots[activeDay] ?? []).filter((s) => s.id !== slotId);
    const next = { ...weekdaySlots };
    if (updated.length === 0) delete next[activeDay];
    else next[activeDay] = updated;
    onChange(next);
  };

  const handleApplyToAll = () => {
    if (activeDay === null || openDays.length <= 1) return;
    const sourceSlots = weekdaySlots[activeDay] ?? [];
    const next = { ...weekdaySlots };
    for (const day of openDays) {
      if (day === activeDay) continue;
      next[day] = sourceSlots.map((s) => ({
        ...s,
        id: `${day}-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      }));
    }
    onChange(next);
  };

  return (
    <div>
      <label className="text-[13px] font-semibold text-[#334155] mb-2 block ml-1">
        Open Days &amp; Slots
      </label>
      <div className="bg-white rounded-[14px] border border-[rgba(226,207,183,0.4)] overflow-hidden">
        <div className="grid grid-cols-7 gap-0.5 px-2 py-3">
          {WEEK_DAYS.map((day, i) => {
            const slots = weekdaySlots[i] ?? [];
            const isOpen = openDays.includes(i);
            const isActive = activeDay === i;
            const hasSlots = slots.length > 0;

            return (
              <button
                key={day}
                type="button"
                onClick={() => handleDayClick(i)}
                className={clsx(
                  "flex flex-col items-center justify-center rounded-xl h-14 gap-0.5 transition-all",
                  isActive && "bg-[#1e293b] ring-2 ring-offset-1 ring-[#1e293b]",
                  isOpen && !isActive && "bg-[rgba(30,41,59,0.12)]",
                  !isOpen && hasSlots && "bg-[rgba(226,207,183,0.35)]",
                  !isOpen && !hasSlots && "bg-[#f8fafc] hover:bg-[rgba(226,207,183,0.15)]",
                )}
              >
                <p
                  className={clsx(
                    "text-[10px] font-bold",
                    isActive ? "text-[#e2cfb7]" : isOpen ? "text-[#1e293b]" : "text-[#94a3b8]",
                  )}
                >
                  {day}
                </p>
                {hasSlots ? (
                  <p
                    className={clsx(
                      "text-[11px] font-bold",
                      isActive ? "text-white" : "text-[#1e293b]",
                    )}
                  >
                    {slots.length} slot{slots.length > 1 ? "s" : ""}
                  </p>
                ) : (
                  <p className={clsx("text-[10px]", isOpen ? "text-[#64748b]" : "text-[#cbd5e1]")}>
                    {isOpen ? "Open" : "Off"}
                  </p>
                )}
              </button>
            );
          })}
        </div>

        {activeDay !== null && (
          <WeekdaySlotEditor
            dayName={WEEK_DAYS[activeDay]}
            slots={weekdaySlots[activeDay] ?? []}
            onAdd={handleAddSlot}
            onRemove={handleRemoveSlot}
            canApplyAll={openDays.length > 1}
            onApplyAll={handleApplyToAll}
          />
        )}
      </div>
    </div>
  );
}

/* ── WeekdaySlotEditor ── */
function WeekdaySlotEditor({
  dayName,
  slots,
  onAdd,
  onRemove,
  canApplyAll,
  onApplyAll,
}: {
  dayName: string;
  slots: TimeSlot[];
  onAdd: (slot: Omit<TimeSlot, "id">) => void;
  onRemove: (id: string) => void;
  canApplyAll: boolean;
  onApplyAll: () => void;
}) {
  const [showForm, setShowForm] = useState(false);
  const [label, setLabel] = useState("");
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("11:00");
  const [maxDogs, setMaxDogs] = useState(8);

  const handleAdd = () => {
    if (!label.trim()) return;
    onAdd({ label, startTime, endTime, maxDogs });
    setLabel("");
    setStartTime("09:00");
    setEndTime("11:00");
    setMaxDogs(8);
    setShowForm(false);
  };

  return (
    <div className="border-t border-[rgba(226,207,183,0.3)] px-4 py-3">
      <div className="flex items-center justify-between mb-3">
        <p className="text-[13px] font-bold text-[#1e293b]">{dayName} — Time Slots</p>
        <button
          type="button"
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[rgba(226,207,183,0.3)] text-[12px] font-bold text-[#1e293b] hover:bg-[rgba(226,207,183,0.5)] transition-colors"
        >
          <span className="material-symbols-outlined" style={{ fontSize: 14 }}>add</span>
          Add Slot
        </button>
      </div>

      {slots.length > 0 && (
        <div className="flex flex-col gap-2 mb-3">
          {slots.map((slot) => (
            <div
              key={slot.id}
              className="flex items-center justify-between bg-[#f8fafc] rounded-xl px-3 py-2.5 border border-[#f1f5f9]"
            >
              <div>
                <p className="text-[13px] font-bold text-[#1e293b]">{slot.label}</p>
                <p className="text-[11px] text-[#64748b]">
                  {slot.startTime} – {slot.endTime} · max {slot.maxDogs} dogs
                </p>
              </div>
              <button
                type="button"
                onClick={() => onRemove(slot.id)}
                className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-red-50 transition-colors group"
              >
                <span
                  className="material-symbols-outlined text-[#94a3b8] group-hover:text-red-400 transition-colors"
                  style={{ fontSize: 16 }}
                >
                  delete
                </span>
              </button>
            </div>
          ))}
        </div>
      )}

      {slots.length === 0 && !showForm && (
        <p className="text-[12px] text-[#94a3b8] text-center py-3">
          No slots yet. Click &ldquo;Add Slot&rdquo; to set a time window.
        </p>
      )}

      {showForm && (
        <div className="bg-[rgba(226,207,183,0.08)] rounded-xl border border-[rgba(226,207,183,0.4)] p-3 flex flex-col gap-3 mb-3">
          <div>
            <p className="text-[10px] font-bold text-[#94a3b8] uppercase tracking-wide mb-1">
              Slot Label
            </p>
            <input
              type="text"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="e.g. Morning Session"
              className="w-full h-10 rounded-lg border border-[rgba(226,207,183,0.4)] bg-white px-3 text-[13px] text-[#1e293b] outline-none focus:border-[#e1cfb7]"
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <p className="text-[10px] font-bold text-[#94a3b8] uppercase tracking-wide mb-1">Start</p>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full h-10 rounded-lg border border-[rgba(226,207,183,0.4)] bg-white px-3 text-[13px] text-[#1e293b] outline-none focus:border-[#e1cfb7]"
              />
            </div>
            <div>
              <p className="text-[10px] font-bold text-[#94a3b8] uppercase tracking-wide mb-1">End</p>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full h-10 rounded-lg border border-[rgba(226,207,183,0.4)] bg-white px-3 text-[13px] text-[#1e293b] outline-none focus:border-[#e1cfb7]"
              />
            </div>
          </div>
          <div>
            <p className="text-[10px] font-bold text-[#94a3b8] uppercase tracking-wide mb-1">Max Dogs</p>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setMaxDogs(Math.max(1, maxDogs - 1))}
                className="w-8 h-8 rounded-full bg-white border border-[rgba(226,207,183,0.4)] flex items-center justify-center text-lg font-bold text-[#1e293b]"
              >
                −
              </button>
              <p className="text-[20px] font-extrabold text-[#1e293b] w-8 text-center">{maxDogs}</p>
              <button
                type="button"
                onClick={() => setMaxDogs(Math.min(50, maxDogs + 1))}
                className="w-8 h-8 rounded-full bg-white border border-[rgba(226,207,183,0.4)] flex items-center justify-center text-lg font-bold text-[#1e293b]"
              >
                +
              </button>
            </div>
          </div>
          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="flex-1 h-10 rounded-xl border border-[#e2e8f0] text-[13px] font-bold text-[#64748b] hover:bg-[#f8fafc] transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleAdd}
              disabled={!label.trim()}
              className="flex-1 h-10 rounded-xl bg-[#1e293b] text-[13px] font-bold text-white disabled:opacity-40 transition-opacity"
            >
              Add
            </button>
          </div>
        </div>
      )}

      {canApplyAll && slots.length > 0 && (
        <button
          type="button"
          onClick={onApplyAll}
          className="w-full flex items-center justify-center gap-1.5 h-9 rounded-xl border border-dashed border-[rgba(226,207,183,0.6)] text-[12px] font-bold text-[#64748b] hover:bg-[rgba(226,207,183,0.1)] transition-colors"
        >
          <span className="material-symbols-outlined" style={{ fontSize: 14 }}>
            content_copy
          </span>
          Apply these slots to all open days
        </button>
      )}
    </div>
  );
}
