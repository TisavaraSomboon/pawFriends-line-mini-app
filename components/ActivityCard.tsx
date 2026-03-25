import clsx from "clsx";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Tooltip from "./Tooltip";

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
  attendees: Attendees[];
  extraCount: number;
  location: string;
  time: string;
  hostAvatar: string;
  hostAlt: string;
  hostName: string;
  isOwner?: boolean;
  isExpired?: boolean;
  isDisableRequest?: boolean;
  allPetsJoined?: boolean;
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
  attendees,
  extraCount,
  location,
  time,
  hostAvatar,
  hostAlt,
  hostName,
  isOwner,
  isExpired,
  isDisableRequest,
  allPetsJoined,
  onJoin,
}: ActivityCardProps) {
  const router = useRouter();
  const isLove = type === "love";

  return (
    <div className="relative">
      {isExpired && (
        <div className="absolute top-3 right-3 z-10 flex items-center gap-1 bg-amber-600 backdrop-blur-sm text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full">
          <span className="material-symbols-outlined" style={{ fontSize: 12 }}>
            event_busy
          </span>
          Expired
        </div>
      )}
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
        {/* Image */}
        <div className="relative h-48 w-full">
          <Image
            src={image}
            alt={imageAlt}
            width={1098}
            height={1098}
            className="w-full h-full object-cover"
          />
          {isLove && (
            <div className="absolute inset-0 bg-gradient-to-t from-rose-900/20 to-transparent" />
          )}
          {!isExpired && (
            <div className={clsx(
              "absolute top-3 right-3 backdrop-blur-sm rounded-full px-3 py-1 flex items-center gap-1",
              isLove ? "bg-rose-500/90 text-white" : "bg-white/90",
            )}>
              <span
                className={clsx("material-symbols-outlined", isLove ? "text-white" : "text-[#9c7f5c]")}
                style={{ fontSize: 16 }}
              >
                {badgeIcon}
              </span>
              <span className={clsx("text-xs font-bold uppercase", isLove ? "text-white" : "text-[#1e293b]")}>
                {badgeLabel}
              </span>
            </div>
          )}
        </div>

        {/* Body */}
        <div className={clsx("p-4 flex flex-col h-full justify-between", isLove && "bg-gradient-to-b from-white to-rose-50/40")}>
          <div>
            <div className="flex justify-between items-start mb-2">
              <h3 className={clsx("text-[17px] font-bold", isLove ? "text-rose-700" : "text-[#1e293b]")}>{title}</h3>
              <div className="flex -space-x-2">
                {attendees?.map((av, i) => (
                  <div
                    key={i}
                    className={clsx("w-6 h-6 rounded-full border-2 bg-[#e2e8f0] overflow-hidden", isLove ? "border-rose-100" : "border-white")}
                  >
                    <Image
                      src={av.image}
                      alt={av.name}
                      className="w-full h-full object-cover rounded-full"
                      width={1098}
                      height={1098}
                    />
                  </div>
                ))}
                {attendees && attendees.length > 0 && (
                  <div className={clsx(
                    "w-6 h-6 rounded-full border-2 flex items-center justify-center text-[10px] font-bold text-[#1e293b]",
                    isLove ? "border-rose-100 bg-rose-50" : "border-white bg-[rgba(226,207,183,0.3)]",
                  )}>
                    +{extraCount}
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-2 mb-4">
              <div className="flex items-center text-[#64748b] text-sm">
                <span
                  className={clsx("material-symbols-outlined mr-2", isLove && "text-rose-400")}
                  style={{ fontSize: 18 }}
                >
                  location_on
                </span>
                <span className="text-ellipsis whitespace-nowrap overflow-hidden">
                  {location}
                </span>
              </div>
              <div className="flex items-center text-[#64748b] text-sm">
                <span
                  className={clsx("material-symbols-outlined mr-2", isLove && "text-rose-400")}
                  style={{ fontSize: 18 }}
                >
                  {isLove ? "calendar_today" : "schedule"}
                </span>
                <span>{isLove ? time.split("–")[0].trim() : time}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              {hostAvatar && (
                <Image
                  src={hostAvatar}
                  alt={hostAlt}
                  className="w-8 h-8 rounded-full object-cover"
                  width={256}
                  height={256}
                />
              )}
              {hostName && (
                <p className="text-xs font-medium text-[#475569]">
                  {isLove ? "Posted by " : "Hosted by "}
                  <span className="font-bold text-[#1e293b]">{hostName}</span>
                </p>
              )}
            </div>
            {isOwner ? (
              <button
                onClick={(e) => {
                  e.preventDefault();
                  router.push("/profile");
                }}
                className={clsx(
                  "hover:opacity-90 px-5 py-2.5 rounded-xl font-bold text-sm transition-opacity z-10 flex justify-center gap-1",
                  isLove ? "bg-rose-500 text-white" : "bg-[#e2cfb7] text-[#1e293b]",
                )}
              >
                <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
                  cards_stack
                </span>
                Manage
              </button>
            ) : (
              <Tooltip
                label={
                  <div className="w-30 text-wrap">
                    {allPetsJoined
                      ? "All your pets already joined this activity."
                      : "You need to add at least 1 pet to join this activity."}
                  </div>
                }
                isDisable={!isDisableRequest && !allPetsJoined}
              >
                <button
                  disabled={isDisableRequest || allPetsJoined}
                  onClick={(e) => {
                    e.preventDefault();
                    onJoin?.();
                  }}
                  className={clsx(
                    "hover:opacity-90 px-5 py-2.5 rounded-xl font-bold text-sm transition-opacity z-10 flex justify-center gap-1",
                    isLove ? "bg-rose-500 text-white" : "bg-[#e2cfb7] text-[#1e293b]",
                    { "opacity-50 hover:opacity-50!": isDisableRequest || allPetsJoined },
                  )}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
                    {isLove ? "favorite" : "cards_stack"}
                  </span>
                  {isLove ? "Find Match" : "Request"}
                </button>
              </Tooltip>
            )}
          </div>
        </div>
      </Link>
    </div>
  );
}
