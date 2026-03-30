import clsx from "clsx";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Tooltip from "./Tooltip";
import { userProfile } from "@/lib/constants";
import AttendeeGrid from "./AttendeeGrid";

interface Attendees {
  image: string;
  name: string;
}

export interface ActivityCardProps {
  id: string;
  type?: string;
  image: string;
  imageAlt: string;
  badgeIcon: string;
  badgeLabel: string;
  title: string;
  attendees?: Attendees[];
  extraCount: number;
  spotLeft: number | "full";
  hostName: string;
  description?: string;
  startTime?: string;
  hostAvatar?: string;
  isOwner?: boolean;
  isExpired?: boolean;
  isDisableRequest?: boolean;
  onJoin?: () => void;
}

export default function ActivityCard({
  id,
  type,
  image,
  imageAlt,
  badgeIcon,
  badgeLabel,
  title,
  attendees = [],
  extraCount,
  spotLeft,
  startTime,
  hostAvatar = userProfile,
  description,
  hostName,
  isOwner,
  isExpired,
  isDisableRequest,
  onJoin,
}: ActivityCardProps) {
  const router = useRouter();
  const isLove = type === "love";

  return (
    <div className="relative">
      <Link
        href={isExpired ? "" : `/activity/${id}`}
        className={clsx(
          "rounded-xl overflow-hidden shadow-sm flex flex-col",
          isLove
            ? "bg-white border border-rose-200"
            : "bg-white border border-[#f1f5f9]",
          { "opacity-50 pointer-events-none": isExpired },
        )}
      >
        {!isExpired && (
          <div
            className={clsx(
              "absolute top-4 right-4 whitespace-nowrap backdrop-blur-sm rounded-full px-2 py-0.5 flex items-center gap-1",
              isLove ? "bg-rose-500/90 text-white" : "bg-white/90",
            )}
          >
            <span
              className={clsx(
                "material-symbols-outlined",
                isLove ? "text-white" : "text-[#9c7f5c]",
              )}
              style={{ fontSize: 12 }}
            >
              {badgeIcon}
            </span>
            <span
              className={clsx(
                "text-[10px] font-bold uppercase",
                isLove ? "text-white" : "text-[#1e293b]",
              )}
            >
              {badgeLabel}
            </span>
          </div>
        )}
        {isExpired && (
          <div className="absolute top-3 right-3 z-10 flex items-center gap-1 bg-amber-600 backdrop-blur-sm text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full">
            <span
              className="material-symbols-outlined"
              style={{ fontSize: 12 }}
            >
              event_busy
            </span>
            Expired
          </div>
        )}
        <div
          className={clsx(
            "p-4 flex flex-col gap-3",
            isLove && "bg-linear-to-b from-white to-rose-50/40",
          )}
        >
          {/* Body: text left, thumbnail right */}
          <div className="flex gap-3 items-start">
            {/* Left: all text content */}
            <div className="flex-1 min-w-0">
              {/* Host row */}
              <div className="flex gap-2 items-center mb-2">
                <div className="w-8 h-8 rounded-full bg-[#e2cfb7] overflow-hidden relative shrink-0">
                  <Image
                    src={hostAvatar}
                    alt={hostName}
                    fill
                    className="object-cover"
                    priority
                  />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-[13px] font-semibold truncate">
                    {hostName}
                  </span>
                  <span className="text-[11px] text-[#94a3b8]">10 km away</span>
                </div>
              </div>

              {/* Title */}
              <h3
                className={clsx(
                  "text-[15px] font-bold leading-snug mb-1.5 line-clamp-2",
                  isLove ? "text-rose-700" : "text-[#1e293b]",
                )}
              >
                {title}
              </h3>

              {/* Time + spots */}
              <div className="flex flex-col gap-0.5 text-[#64748b] text-[11px] mb-2">
                {startTime ? (
                  <div className="flex gap-1 items-center">
                    <span
                      className={clsx(
                        "material-symbols-outlined",
                        isLove && "text-rose-400",
                      )}
                      style={{ fontSize: 12 }}
                    >
                      {isLove ? "calendar_today" : "schedule"}
                    </span>
                    <span className="truncate">{startTime}</span>
                  </div>
                ) : (
                  <div className="flex gap-1 items-center">
                    <span
                      className={clsx(
                        "material-symbols-outlined",
                        isLove && "text-rose-400",
                      )}
                      style={{ fontSize: 12 }}
                    >
                      cases
                    </span>
                    Business
                  </div>
                )}
                {!!spotLeft && (
                  <div className="flex gap-1 items-center text-red-600">
                    <span
                      className="material-symbols-outlined"
                      style={{ fontSize: 12 }}
                    >
                      family_group
                    </span>
                    <span>{spotLeft} spot left</span>
                  </div>
                )}
              </div>

              {/* Attendee avatars */}
              {attendees.length > 0 && (
                <div className="mb-2">
                  <AttendeeGrid
                    attendees={attendees}
                    isLove={isLove}
                    size="xs"
                    extraCount={attendees.length > 3 ? extraCount : undefined}
                  />
                </div>
              )}

              {/* Description */}
              <p className="text-[12px] text-[#64748b] line-clamp-2 leading-relaxed">
                {description ?? ""}
              </p>
            </div>

            {/* Right: thumbnail + badge */}
            {image && (
              <div className="shrink-0 relative mt-8">
                <Image
                  src={image}
                  alt={imageAlt}
                  width={96}
                  height={96}
                  className="w-24 h-24 object-cover rounded-xl"
                />
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between gap-3">
            {isOwner ? (
              <button
                onClick={(e) => {
                  e.preventDefault();
                  router.push("/profile");
                }}
                className={clsx(
                  "hover:opacity-90 px-5 py-2.5 rounded-xl font-bold text-sm transition-opacity z-10 flex justify-center gap-1 w-full",
                  isLove
                    ? "bg-rose-500 text-white"
                    : "bg-[#e2cfb7] text-[#1e293b]",
                )}
              >
                <span
                  className="material-symbols-outlined"
                  style={{ fontSize: 18 }}
                >
                  cards_stack
                </span>
                Manage
              </button>
            ) : (
              <Tooltip
                className="w-full"
                label={
                  <div className="text-wrap">
                    {isDisableRequest
                      ? "All your pets already joined this activity."
                      : "You need to add at least 1 pet to join this activity."}
                  </div>
                }
                isDisable={!isDisableRequest}
              >
                <button
                  disabled={isDisableRequest}
                  onClick={(e) => {
                    e.preventDefault();
                    onJoin?.();
                  }}
                  className={clsx(
                    "hover:opacity-90 px-5 py-2.5 rounded-xl font-bold text-sm transition-opacity z-10 flex justify-center gap-1 w-full",
                    isLove
                      ? "bg-rose-500 text-white"
                      : "bg-[#e2cfb7] text-[#1e293b]",
                    {
                      "opacity-50 hover:opacity-50!": isDisableRequest,
                    },
                  )}
                >
                  <span
                    className="material-symbols-outlined"
                    style={{ fontSize: 18 }}
                  >
                    {isLove ? "favorite" : "cards_stack"}
                  </span>
                  {isLove ? "Match" : "Request"}
                </button>
              </Tooltip>
            )}
          </div>
        </div>
      </Link>
    </div>
  );
}
