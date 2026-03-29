"use client";

import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import dayjs from "dayjs";
import clsx from "clsx";
import { Suspense } from "react";

/* ── Mock data ── */
const MOCK_ATTENDEES = [
  {
    id: "1",
    name: "Mochi",
    ownerName: "Nisa K.",
    image:
      "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=200&h=200&fit=crop",
    breed: "Golden Retriever",
    size: "LG",
    slot: "09:00 – 11:00",
    status: "joined" as const,
  },
  {
    id: "2",
    name: "Biscuit",
    ownerName: "Tanya P.",
    image:
      "https://images.unsplash.com/photo-1537151625747-768eb6cf92b2?w=200&h=200&fit=crop",
    breed: "French Bulldog",
    size: "SM",
    slot: "09:00 – 11:00",
    status: "joined" as const,
  },
  {
    id: "3",
    name: "Luna",
    ownerName: "Kate S.",
    image:
      "https://images.unsplash.com/photo-1561037404-61cd46aa615b?w=200&h=200&fit=crop",
    breed: "Shiba Inu",
    size: "MD",
    slot: "13:00 – 15:00",
    status: "pending" as const,
  },
  {
    id: "4",
    name: "Max",
    ownerName: "Dang W.",
    image:
      "https://images.unsplash.com/photo-1552053831-71594a27632d?w=200&h=200&fit=crop",
    breed: "Labrador",
    size: "LG",
    slot: "13:00 – 15:00",
    status: "joined" as const,
  },
  {
    id: "5",
    name: "Coco",
    ownerName: "Ann T.",
    image:
      "https://images.unsplash.com/photo-1518717758536-85ae29035b6d?w=200&h=200&fit=crop",
    breed: "Poodle",
    size: "SM",
    slot: "16:00 – 18:00",
    status: "joined" as const,
  },
];

const SIZE_LABEL: Record<string, string> = {
  XS: "Very Small",
  SM: "Small",
  MD: "Medium",
  LG: "Large",
  XL: "Extra Large",
};

function AttendeeCard({
  attendee,
}: {
  attendee: (typeof MOCK_ATTENDEES)[number];
}) {
  const isJoined = attendee.status === "joined";
  return (
    <div className="bg-white rounded-2xl border border-[#f1f5f9] px-4 py-4 flex items-center gap-3 w-full">
      <div className="w-14 h-14 rounded-xl overflow-hidden shrink-0 bg-[#f1f5f9]">
        <Image
          src={attendee.image}
          alt={attendee.name}
          width={56}
          height={56}
          className="w-full h-full object-cover"
        />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <p className="text-[15px] font-bold text-[#1e293b] truncate">
            {attendee.name}
          </p>
          <span
            className={clsx(
              "text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0",
              isJoined
                ? "bg-green-100 text-green-700"
                : "bg-amber-100 text-amber-700",
            )}
          >
            {isJoined ? "Joined" : "Pending"}
          </span>
        </div>
        <p className="text-[12px] text-[#64748b] truncate">
          {attendee.breed} · {SIZE_LABEL[attendee.size]}
        </p>
        <p className="text-[11px] text-[#94a3b8] mt-0.5 truncate">
          Owner: {attendee.ownerName}
        </p>
      </div>

      <div className="flex flex-col items-end gap-1 shrink-0">
        <div className="flex items-center gap-1 bg-[#f8fafc] rounded-lg px-2 py-1">
          <span
            className="material-symbols-outlined text-[#94a3b8]"
            style={{ fontSize: 12 }}
          >
            schedule
          </span>
          <span className="text-[11px] font-semibold text-[#64748b]">
            {attendee.slot}
          </span>
        </div>
      </div>
    </div>
  );
}

function AttendeesDetailsContent() {
  const router = useRouter();
  const params = useSearchParams();
  const date = params.get("date") ?? dayjs().format("YYYY-MM-DD");

  const formattedDate = dayjs(date).format("dddd, D MMMM YYYY");
  const isToday = dayjs(date).isSame(dayjs(), "day");

  // Group mock attendees by slot for display
  const slots = Array.from(new Set(MOCK_ATTENDEES.map((a) => a.slot)));

  return (
    <div className="min-h-dvh bg-[#f7f7f6] flex flex-col w-full">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[rgba(225,207,183,0.2)] bg-[#f7f7f6] sticky top-0 z-10">
        <button
          className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-[rgba(226,207,183,0.2)] transition-colors"
          onClick={() => router.back()}
        >
          <span className="material-symbols-outlined text-[#1e293b]">
            arrow_back
          </span>
        </button>
        <h2 className="text-[17px] font-bold text-[#1e293b] tracking-tight">
          Attendees
        </h2>
        <div className="w-10" />
      </div>

      <div className="flex-1 flex justify-center">
        <div className="w-full max-w-lg px-4 py-5 flex flex-col gap-5">
          {/* Date banner */}
          <div className="bg-white rounded-2xl border border-[#f1f5f9] px-5 py-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-[rgba(226,207,183,0.3)] flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[#1e293b]">
                calendar_month
              </span>
            </div>
            <div>
              <p className="text-[15px] font-bold text-[#1e293b]">
                {formattedDate}
              </p>
              <p className="text-[12px] text-[#94a3b8] mt-0.5">
                {isToday ? "Today · " : ""}
                {MOCK_ATTENDEES.length} attendees across {slots.length} slots
              </p>
            </div>
          </div>

          {/* Slot groups */}
          {slots.map((slot) => {
            const group = MOCK_ATTENDEES.filter((a) => a.slot === slot);
            return (
              <div key={slot} className="flex flex-col gap-2">
                <div className="flex items-center gap-2 px-1">
                  <span
                    className="material-symbols-outlined text-[#e2cfb7]"
                    style={{ fontSize: 15 }}
                  >
                    schedule
                  </span>
                  <p className="text-[12px] font-bold text-[#64748b] uppercase tracking-wide">
                    {slot}
                  </p>
                  <div className="flex-1 h-px bg-[rgba(226,207,183,0.4)]" />
                  <span className="text-[11px] text-[#94a3b8] font-semibold">
                    {group.length} dog{group.length !== 1 ? "s" : ""}
                  </span>
                </div>
                <div className="flex flex-col gap-2">
                  {group.map((attendee) => (
                    <AttendeeCard key={attendee.id} attendee={attendee} />
                  ))}
                </div>
              </div>
            );
          })}

          {/* Empty state (shown when no mock data) */}
          {MOCK_ATTENDEES.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <div className="w-16 h-16 rounded-full bg-[rgba(226,207,183,0.2)] flex items-center justify-center">
                <span
                  className="material-symbols-outlined text-[#e2cfb7]"
                  style={{ fontSize: 32 }}
                >
                  pets
                </span>
              </div>
              <p className="text-[15px] font-bold text-[#1e293b]">
                No attendees yet
              </p>
              <p className="text-[13px] text-[#94a3b8] text-center">
                No dogs have joined for this day.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function AttendeesDetailsPage() {
  return (
    <Suspense>
      <AttendeesDetailsContent />
    </Suspense>
  );
}
