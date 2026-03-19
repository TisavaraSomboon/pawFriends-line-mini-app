import clsx from "clsx";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface Avatar {
  src: string;
  alt: string;
}

export interface ActivityCardProps {
  id: string;
  image: string;
  imageAlt: string;
  badgeIcon: string;
  badgeLabel: string;
  title: string;
  avatars: Avatar[];
  extraCount: number;
  location: string;
  time: string;
  hostAvatar: string;
  hostAlt: string;
  hostName: string;
  isOwner?: boolean;
  isExpired?: boolean;
  onJoin?: () => void;
}

export default function ActivityCard({
  id,
  image,
  imageAlt,
  badgeIcon,
  badgeLabel,
  title,
  avatars,
  extraCount,
  location,
  time,
  hostAvatar,
  hostAlt,
  hostName,
  isOwner,
  isExpired,
  onJoin,
}: ActivityCardProps) {
  const router = useRouter();

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
          "bg-white rounded-xl overflow-hidden shadow-sm border border-[#f1f5f9] flex flex-col",
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
          {!isExpired && (
            <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1 flex items-center gap-1">
              <span
                className="material-symbols-outlined text-[#9c7f5c]"
                style={{ fontSize: 16 }}
              >
                {badgeIcon}
              </span>
              <span className="text-xs font-bold text-[#1e293b] uppercase">
                {badgeLabel}
              </span>
            </div>
          )}
        </div>

        {/* Body */}
        <div className="p-4 flex flex-col h-full justify-between">
          <div>
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-[17px] font-bold text-[#1e293b]">{title}</h3>
              <div className="flex -space-x-2">
                {avatars.map((av, i) => (
                  <div
                    key={i}
                    className="w-6 h-6 rounded-full border-2 border-white bg-[#e2e8f0] overflow-hidden"
                  >
                    <Image
                      src={av.src}
                      alt={av.alt}
                      className="w-full h-full object-cover rounded-full"
                      width={1098}
                      height={1098}
                    />
                  </div>
                ))}
                {avatars.length > 0 && (
                  <div className="w-6 h-6 rounded-full border-2 border-white bg-[rgba(226,207,183,0.3)] flex items-center justify-center text-[10px] font-bold text-[#1e293b]">
                    +{extraCount}
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-2 mb-4">
              <div className="flex items-center text-[#64748b] text-sm">
                <span
                  className="material-symbols-outlined mr-2"
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
                  className="material-symbols-outlined mr-2"
                  style={{ fontSize: 18 }}
                >
                  schedule
                </span>
                <span>{time}</span>
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
                  Hosted by{" "}
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
                className="bg-[#e2cfb7] hover:opacity-90 text-[#1e293b] px-5 py-2.5 rounded-xl font-bold text-sm transition-opacity z-10 flex justify-center gap-1"
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
              <button
                onClick={(e) => {
                  e.preventDefault();
                  onJoin?.();
                }}
                className="bg-[#e2cfb7] hover:opacity-90 text-[#1e293b] px-5 py-2.5 rounded-xl font-bold text-sm transition-opacity z-10 flex justify-center gap-1"
              >
                <span
                  className="material-symbols-outlined"
                  style={{ fontSize: 18 }}
                >
                  cards_stack
                </span>
                Request
              </button>
            )}
          </div>
        </div>
      </Link>
    </div>
  );
}
