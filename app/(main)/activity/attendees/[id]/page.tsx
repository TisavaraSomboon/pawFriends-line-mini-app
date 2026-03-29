"use client";

import { useRouter, useSearchParams, useParams } from "next/navigation";
import Image from "next/image";
import dayjs from "dayjs";
import clsx from "clsx";
import { Suspense } from "react";
import { useAttendees } from "@/lib/queries";

const SIZE_LABEL: Record<string, string> = {
  XS: "Very Small",
  SM: "Small",
  MD: "Medium",
  LG: "Large",
  XL: "Extra Large",
};

type EnrichedAttendee = {
  _id: string;
  attendeeId?: string;
  name?: string;
  image?: string;
  breed?: string;
  size?: string;
  ownerName?: string;
  locationName?: string;
  vaccine?: boolean;
  fleaTick?: boolean;
  microchipVerified?: boolean;
  requestMessage?: string;
  status: "pending" | "joined" | "rejected";
  startDate?: string;
  endDate?: string;
  role: "pet" | "user";
};

function AttendeeCard({ attendee }: { attendee: EnrichedAttendee }) {
  const router = useRouter();
  const isJoined = attendee.status === "joined";
  const slot =
    attendee.startDate && attendee.endDate
      ? `${dayjs(attendee.startDate).format("HH:mm")} – ${dayjs(attendee.endDate).format("HH:mm")}`
      : null;

  return (
    <div
      className="bg-white rounded-2xl border border-[#f1f5f9] px-4 py-4 flex items-start gap-3 w-full cursor-pointer active:scale-[0.99] transition-transform"
      onClick={() =>
        attendee.attendeeId &&
        router.push(`/profile/${attendee.attendeeId}`)
      }
    >
      <div className="w-14 h-14 rounded-xl overflow-hidden shrink-0 bg-[#f1f5f9]">
        {attendee.image ? (
          <Image
            src={attendee.image}
            alt={attendee.name ?? ""}
            width={56}
            height={56}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="material-symbols-outlined text-[#94a3b8]">
              pets
            </span>
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0">
        {/* Name + status */}
        <div className="flex items-center gap-2 mb-0.5">
          <p className="text-[15px] font-bold text-[#1e293b] truncate">
            {attendee.name ?? "Unknown"}
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

        {/* Breed · Size */}
        {(attendee.breed || attendee.size) && (
          <p className="text-[12px] text-[#64748b] truncate mb-1">
            {[
              attendee.breed,
              attendee.size ? SIZE_LABEL[attendee.size] : null,
            ]
              .filter(Boolean)
              .join(" · ")}
          </p>
        )}

        {/* Owner */}
        {attendee.ownerName && (
          <span className="flex items-center gap-1 text-[11px] text-[#94a3b8] mb-2">
            <span className="material-symbols-outlined" style={{ fontSize: 12 }}>person</span>
            {attendee.ownerName}
          </span>
        )}

        {/* Health badges */}
        <div className="flex flex-wrap gap-1.5 mb-2">
          <span
            className={clsx(
              "flex items-center gap-1 text-[11px] font-semibold px-2 py-1 rounded-lg border",
              attendee.vaccine
                ? "bg-blue-50 text-blue-600 border-blue-100"
                : "bg-red-50 text-red-500 border-red-100",
            )}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 13 }}>vaccines</span>
            Vaccine
            <span className="font-bold">
              {attendee.vaccine ? "✓" : "✗"}
            </span>
          </span>

          <span
            className={clsx(
              "flex items-center gap-1 text-[11px] font-semibold px-2 py-1 rounded-lg border",
              attendee.fleaTick
                ? "bg-emerald-50 text-emerald-600 border-emerald-100"
                : "bg-red-50 text-red-500 border-red-100",
            )}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 13 }}>bug_report</span>
            Flea &amp; Tick
            <span className="font-bold">
              {attendee.fleaTick ? "✓" : "✗"}
            </span>
          </span>

          <span
            className={clsx(
              "flex items-center gap-1 text-[11px] font-semibold px-2 py-1 rounded-lg border",
              attendee.microchipVerified
                ? "bg-violet-50 text-violet-600 border-violet-100"
                : "bg-red-50 text-red-500 border-red-100",
            )}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 13 }}>id_card</span>
            Dog ID
            <span className="font-bold">
              {attendee.microchipVerified ? "✓" : "✗"}
            </span>
          </span>
        </div>

        {/* Location — clickable, ready for Google Maps */}
        {attendee.locationName && (
          <button
            className="flex items-center gap-1 text-[11px] font-medium text-[#e2cfb7] hover:text-[#c9a87a] transition-colors mb-1.5 max-w-full"
            onClick={(e) => {
              e.stopPropagation();
              // TODO: open Google Maps in next phase
            }}
          >
            <span className="material-symbols-outlined shrink-0" style={{ fontSize: 13 }}>location_on</span>
            <span className="truncate">{attendee.locationName}</span>
            <span className="material-symbols-outlined shrink-0 opacity-60" style={{ fontSize: 11 }}>open_in_new</span>
          </button>
        )}

        {/* Request message */}
        {attendee.requestMessage && (
          <div className="mt-0.5 bg-[#f8fafc] rounded-xl px-3 py-2 border border-[#f1f5f9]">
            <p className="text-[11px] text-[#64748b] italic leading-snug line-clamp-2">
              &ldquo;{attendee.requestMessage}&rdquo;
            </p>
          </div>
        )}
      </div>

      {slot && (
        <div className="flex flex-col items-end gap-1 shrink-0">
          <div className="flex items-center gap-1 bg-[#f8fafc] rounded-lg px-2 py-1">
            <span
              className="material-symbols-outlined text-[#94a3b8]"
              style={{ fontSize: 12 }}
            >
              schedule
            </span>
            <span className="text-[11px] font-semibold text-[#64748b]">
              {slot}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

function AttendeesDetailsContent() {
  const router = useRouter();
  const { id: activityId } = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const date = searchParams.get("date") ?? dayjs().format("YYYY-MM-DD");

  const { data, isLoading } = useAttendees(activityId);
  const allAttendees = (data as unknown as EnrichedAttendee[]) ?? [];

  const formattedDate = dayjs(date).format("dddd, D MMMM YYYY");
  const isToday = dayjs(date).isSame(dayjs(), "day");

  // Filter by selected date
  const filtered = allAttendees.filter((a) => {
    if (!a.startDate) return true;
    return dayjs(a.startDate).format("YYYY-MM-DD") === date;
  });

  // Group by time slot
  const slotMap = new Map<string, EnrichedAttendee[]>();
  for (const a of filtered) {
    const slot =
      a.startDate && a.endDate
        ? `${dayjs(a.startDate).format("HH:mm")} – ${dayjs(a.endDate).format("HH:mm")}`
        : "No slot";
    if (!slotMap.has(slot)) slotMap.set(slot, []);
    slotMap.get(slot)!.push(a);
  }
  const slots = Array.from(slotMap.entries());

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
                {isLoading
                  ? "Loading..."
                  : `${filtered.length} attendee${filtered.length !== 1 ? "s" : ""} across ${slots.length} slot${slots.length !== 1 ? "s" : ""}`}
              </p>
            </div>
          </div>

          {/* Loading skeleton */}
          {isLoading && (
            <div className="flex flex-col gap-2">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="bg-white rounded-2xl border border-[#f1f5f9] px-4 py-4 h-20 animate-pulse"
                />
              ))}
            </div>
          )}

          {/* Slot groups */}
          {!isLoading &&
            slots.map(([slot, group]) => (
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
                    <AttendeeCard key={attendee._id} attendee={attendee} />
                  ))}
                </div>
              </div>
            ))}

          {/* Empty state */}
          {!isLoading && filtered.length === 0 && (
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
