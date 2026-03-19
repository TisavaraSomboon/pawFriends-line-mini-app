"use client";

import ActivityCard from "@/components/ActivityCard";
import SpinLoader from "@/components/SpinLoader";
import { ACTIVITY_TYPE_BADGE, formatActivityTime } from "@/lib/constants";
import { useActivities } from "@/lib/queries";
import { useSearchParams } from "next/navigation";
import { useAuthUser } from "@/lib/queries";
import Link from "next/link";

export default function ActivitiesPage() {
  const searchParams = useSearchParams();
  const params = new URLSearchParams(searchParams.toString());
  const userId = params.get("Id");

  const { data: user } = useAuthUser();
  const ownerId = user?._id;

  const { data: activities, isFetching: isActivitiesFetching } = useActivities(
    userId ?? ownerId,
  );

  if (isActivitiesFetching) return <SpinLoader title="Activities loading" />;

  return (
    <div>
      <div className="flex items-center justify-between px-4 md:px-8 py-3 border-b border-[rgba(225,207,183,0.2)] bg-[#f7f7f6] sticky top-0 z-10">
        <Link
          href="/"
          className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-[rgba(226,207,183,0.2)] transition-colors"
        >
          <span className="material-symbols-outlined text-[#1e293b]">
            arrow_back
          </span>
        </Link>
        <h1 className="text-[17px] font-bold text-[#1e293b] md:text-xl tracking-tight text-center w-full">
          {!userId && "My "}Activities
        </h1>
      </div>

      {/* Mobile: stacked / Desktop: 2-col grid */}
      <div className="flex m-10 flex-wrap">
        {activities && activities.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {activities.map((activity) => {
              const badge = ACTIVITY_TYPE_BADGE[activity.type] ?? {
                icon: "pets",
                label: activity.type,
              };
              return (
                <ActivityCard
                  key={activity._id}
                  id={activity._id}
                  image={activity.image ?? ""}
                  imageAlt={activity.title}
                  badgeIcon={badge.icon}
                  badgeLabel={badge.label}
                  title={activity.title}
                  avatars={[]}
                  extraCount={activity.maxDogs}
                  location={activity.locationName}
                  time={formatActivityTime(
                    activity.startDate,
                    activity.endDate,
                  )}
                  hostAvatar=""
                  hostAlt=""
                  hostName=""
                  isOwner={!userId}
                  isExpired={
                    !!activity.endDate &&
                    new Date(activity.endDate) < new Date()
                  }
                />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
