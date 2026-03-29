"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import clsx from "clsx";

export type AttendeeItem = {
  image: string;
  name: string;
  status?: "pending" | "joined" | "rejected";
  ownerId?: string;
  attendeeId?: string;
};

type Props = {
  attendees: AttendeeItem[];
  isLove?: boolean;
  /**
   * "xs" = compact overlapping row, 20px (ActivityCard)
   * "sm" = compact overlapping row, 32px (preview stack)
   * "md" = full grid with names (default)
   */
  size?: "xs" | "sm" | "md";
  /** Only used in xs/sm mode: shows a +N overflow bubble */
  extraCount?: number;
};

export default function AttendeeGrid({
  attendees,
  isLove,
  size = "md",
  extraCount,
}: Props) {
  const router = useRouter();

  // ── Compact overlapping row (xs = 20px, sm = 32px) ──
  if (size === "xs" || size === "sm") {
    const dim = size === "xs" ? "w-5 h-5" : "w-8 h-8";
    const gap = size === "xs" ? "-space-x-1.5" : "-space-x-2";
    const dotSize = size === "xs" ? "w-2.5 h-2.5" : "w-3.5 h-3.5";
    const imgPx = size === "xs" ? 40 : 64;
    const overflowDim = size === "xs" ? "w-5 h-5" : "w-8 h-8";
    const overflowText = size === "xs" ? "text-[9px]" : "text-[10px]";

    return (
      <div className={clsx("flex", gap)}>
        {attendees.map((av, i) => (
          <div
            key={i}
            className={clsx(
              "relative rounded-full border-2 bg-[#e2e8f0] overflow-visible shrink-0",
              dim,
              isLove ? "border-rose-100" : "border-white",
            )}
          >
            <div className="w-full h-full rounded-full overflow-hidden">
              <Image
                src={av.image}
                alt={av.name}
                className="w-full h-full object-cover rounded-full"
                width={imgPx}
                height={imgPx}
              />
            </div>
            {av.status === "pending" && (
              <span
                className={clsx(
                  "absolute -bottom-0.5 -right-0.5 rounded-full bg-amber-400 border border-white",
                  dotSize,
                )}
                title="Pending approval"
              />
            )}
          </div>
        ))}
        {!!extraCount && (
          <div
            className={clsx(
              "rounded-full border-2 flex items-center justify-center font-bold text-[#1e293b] shrink-0",
              overflowDim,
              overflowText,
              isLove
                ? "border-rose-100 bg-rose-50"
                : "border-white bg-[rgba(226,207,183,0.3)]",
            )}
          >
            +{extraCount}
          </div>
        )}
      </div>
    );
  }

  // ── md — full grid with names ──
  return (
    <div className="flex flex-wrap gap-4">
      {attendees.map(({ image, name, status, ownerId, attendeeId }) => (
        <button
          key={name}
          onClick={() =>
            ownerId &&
            router.push(
              `/profile/${ownerId}${attendeeId ? `?Id=${attendeeId}` : ""}`,
            )
          }
          className="flex flex-col items-center gap-1 w-16"
        >
          <div className="relative">
            <div
              className={clsx(
                "w-14 h-14 rounded-full overflow-hidden border-2",
                isLove ? "border-rose-300" : "border-[#e2cfb7]",
              )}
            >
              <Image
                src={image}
                alt={name}
                className="w-full h-full object-cover"
                width={56}
                height={56}
              />
            </div>
            {status === "pending" && (
              <div
                className="absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full bg-amber-400 border-2 border-white flex items-center justify-center"
                title="Pending approval"
              >
                <span
                  className="material-symbols-outlined text-white"
                  style={{ fontSize: 11 }}
                >
                  schedule
                </span>
              </div>
            )}
          </div>
          <p
            className={clsx(
              "text-xs font-medium text-center truncate w-full",
              status === "pending" ? "text-amber-600" : "text-[#475569]",
            )}
          >
            {name}
          </p>
        </button>
      ))}
    </div>
  );
}
