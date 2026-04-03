"use client";

import { useState } from "react";
import {
  PetSizeCategory,
  useActivities,
  useCreateAttendees,
  useProfile,
  useSendFeedback,
} from "@/lib/queries";
import { ACTIVITY_TYPE_BADGE, formatStartTim } from "@/lib/constants";
import SpinLoader from "@/components/SpinLoader";
import RequestModal from "@/components/RequestModal";
import { useRouter } from "next/navigation";
import ActivityCard from "@/components/activity/ActivityCard";

const FILTERS = ["All Activities", "Nearby", "Today"] as const;
type Filter = (typeof FILTERS)[number];

export default function HomePage() {
  const router = useRouter();
  const [activeFilter, setActiveFilter] = useState<Filter>("All Activities");
  const [search, setSearch] = useState("");
  const [joinActivityId, setJoinActivityId] = useState<string | null>(null);

  const { data: allProfiles, isPending: isUserPending } = useProfile();
  const { data: activities, isPending: isActivitiesFetching } = useActivities();
  const { mutate: createAttendee } = useCreateAttendees();

  if (isActivitiesFetching) return <SpinLoader title="Loading home" />;

  const NEARBY_KM = 20;
  function distanceKm(lat1: number, lon1: number, lat2: number, lon2: number) {
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }

  const userLat = allProfiles?.user?.latitude;
  const userLon = allProfiles?.user?.longitude;
  const todayStr = new Date().toDateString();

  const filteredActivities = (activities ?? []).filter((activity) => {
    if (activity.status === "paused") return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      const match =
        activity.title?.toLowerCase().includes(q) ||
        activity.description?.toLowerCase().includes(q) ||
        activity.locationName?.toLowerCase().includes(q);
      if (!match) return false;
    }
    if (activeFilter === "Today") {
      if (!activity.startDate) return false;
      if (new Date(activity.startDate).toDateString() !== todayStr)
        return false;
    }
    if (activeFilter === "Nearby") {
      if (!userLat || !userLon || !activity.latitude || !activity.longitude)
        return false;
      if (
        distanceKm(userLat, userLon, activity.latitude, activity.longitude) >
        NEARBY_KM
      )
        return false;
    }
    return true;
  });

  const businessActivities = filteredActivities.filter(
    (a) => a.hostType === "business",
  );
  const personalActivities = filteredActivities.filter(
    (a) => a.hostType !== "business",
  );

  return (
    <div className="flex flex-col min-h-dvh bg-[#f7f7f6]">
      {/* Header */}
      <header className="sticky top-0 bg-[#f7f7f6]/90 backdrop-blur-md px-4 pt-4 pb-2 z-20">
        <div className="max-w-lg mx-auto">
          <div className="flex items-center justify-between mb-3">
            <h1 className="text-[18px] font-bold text-[#1e293b]">PawFriends</h1>
            {allProfiles?.user?.locationName && (
              <div className="flex items-center gap-1 text-xs text-[#64748b]">
                <span
                  className="material-symbols-outlined"
                  style={{ fontSize: 14 }}
                >
                  location_on
                </span>
                <span className="truncate max-w-[120px]">
                  {allProfiles.user.locationName}
                </span>
              </div>
            )}
          </div>
          <SearchAndFilters
            search={search}
            setSearch={setSearch}
            activeFilter={activeFilter}
            setActiveFilter={setActiveFilter}
          />
        </div>
      </header>

      {/* Feed */}
      <main className="flex-1 px-4 py-4">
        <div className="max-w-lg mx-auto">
          {filteredActivities.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
              <div className="w-20 h-20 rounded-full bg-[rgba(226,207,183,0.2)] flex items-center justify-center">
                <span
                  className="material-symbols-outlined text-[#e2cfb7]"
                  style={{ fontSize: 40 }}
                >
                  pets
                </span>
              </div>
              <div>
                <p className="text-[17px] font-bold text-[#1e293b]">
                  No activities yet
                </p>
                <p className="text-[13px] text-[#64748b] mt-1">
                  Be the first to create an activity for the pack!
                </p>
              </div>
              <a
                href="/create-activity"
                className="mt-2 bg-[#1e293b] text-white font-bold text-[14px] px-6 py-3 rounded-xl flex items-center gap-2"
              >
                <span
                  className="material-symbols-outlined"
                  style={{ fontSize: 18 }}
                >
                  add
                </span>
                Create Activity
              </a>
            </div>
          )}

          {filteredActivities.length > 0 && (
            <>
              <RequestModal
                open={!!joinActivityId}
                pets={allProfiles?.pets ?? []}
                activityType={
                  filteredActivities.find((a) => a._id === joinActivityId)?.type
                }
                activitySizes={
                  filteredActivities.find((a) => a._id === joinActivityId)
                    ?.sizes
                }
                onConfirm={(selectedId, message) => {
                  if (!joinActivityId) return;
                  const activity = filteredActivities.find(
                    (a) => a._id === joinActivityId,
                  );
                  const pet = allProfiles?.pets.find(
                    (p) => p._id === selectedId,
                  );
                  const sizeMatch =
                    !activity?.sizes?.length ||
                    !pet?.size ||
                    activity.sizes.includes(pet.size as PetSizeCategory);
                  createAttendee(
                    {
                      activityId: joinActivityId,
                      attendeeId: selectedId,
                      role: "pet",
                      status: sizeMatch ? "joined" : "pending",
                      requestMessage:
                        message ??
                        (sizeMatch
                          ? undefined
                          : "The dogs size not match with the request"),
                    },
                    { onSuccess: () => setJoinActivityId(null) },
                  );
                }}
                onCancel={() => setJoinActivityId(null)}
              />

              {/* Business section */}
              {businessActivities.length > 0 && (
                <section className="mb-6">
                  <div className="flex items-center gap-2 mb-3">
                    <span
                      className="material-symbols-outlined text-[#e2cfb7]"
                      style={{ fontSize: 18 }}
                    >
                      storefront
                    </span>
                    <h2 className="text-[15px] font-bold text-[#1e293b]">
                      Business & Services
                    </h2>
                    <span className="ml-auto text-[11px] font-semibold text-[#94a3b8]">
                      {businessActivities.length} place
                      {businessActivities.length !== 1 ? "s" : ""}
                    </span>
                  </div>
                  <div className="flex flex-col gap-4">
                    {businessActivities.map((activity) => {
                      const badge = ACTIVITY_TYPE_BADGE[activity.type] ?? {
                        icon: "storefront",
                        label: activity.type,
                      };
                      return (
                        <ActivityCard
                          key={activity._id}
                          id={activity._id}
                          type={activity.type}
                          image={activity.image ?? ""}
                          imageAlt={activity.title}
                          badgeIcon={badge.icon}
                          badgeLabel={badge.label}
                          title={activity.title}
                          attendees={activity.attendees}
                          extraCount={activity.maxDogs}
                          startTime={
                            activity.startDate
                              ? formatStartTim(activity.startDate)
                              : undefined
                          }
                          spotLeft={
                            activity.amountOfAttendees -
                            activity.attendees.length
                          }
                          hostAvatar={activity.owner.image}
                          hostName={activity.owner.name}
                          description={activity.description}
                          isOwner={
                            allProfiles?.user?._id === activity?.owner?._id
                          }
                          isExpired={
                            !!activity.endDate &&
                            new Date(activity.endDate) < new Date()
                          }
                          isDisableRequest={false}
                          onJoin={() =>
                            router.push(`/activity/${activity._id}`)
                          }
                        />
                      );
                    })}
                  </div>
                </section>
              )}

              {/* Personal section */}
              {personalActivities.length > 0 && (
                <section>
                  <div className="flex items-center gap-2 mb-3">
                    <span
                      className="material-symbols-outlined text-[#e2cfb7]"
                      style={{ fontSize: 18 }}
                    >
                      pets
                    </span>
                    <h2 className="text-[15px] font-bold text-[#1e293b]">
                      Community Events
                    </h2>
                    <span className="ml-auto text-[11px] font-semibold text-[#94a3b8]">
                      {personalActivities.length} event
                      {personalActivities.length !== 1 ? "s" : ""}
                    </span>
                  </div>
                  <div className="flex flex-col gap-4">
                    {personalActivities.map((activity) => {
                      const badge = ACTIVITY_TYPE_BADGE[activity.type] ?? {
                        icon: "pets",
                        label: activity.type,
                      };
                      return (
                        <ActivityCard
                          key={activity._id}
                          id={activity._id}
                          type={activity.type}
                          image={activity.image ?? ""}
                          imageAlt={activity.title}
                          badgeIcon={badge.icon}
                          badgeLabel={badge.label}
                          title={activity.title}
                          attendees={activity.attendees}
                          extraCount={activity.maxDogs}
                          startTime={
                            activity.startDate
                              ? formatStartTim(activity.startDate)
                              : undefined
                          }
                          spotLeft={
                            activity.amountOfAttendees -
                            activity.attendees.length
                          }
                          hostAvatar={activity.owner.image}
                          hostName={activity.owner.name}
                          description={activity.description}
                          isOwner={
                            allProfiles?.user?._id === activity?.owner?._id
                          }
                          isExpired={
                            !!activity.endDate &&
                            new Date(activity.endDate) < new Date()
                          }
                          isDisableRequest={
                            !!allProfiles &&
                            allProfiles.pets.length > 0 &&
                            allProfiles.pets.every((pet) =>
                              activity.attendees?.some(
                                (a) => a.name === pet.name,
                              ),
                            )
                          }
                          onJoin={() => {
                            if (allProfiles && allProfiles.pets.length > 0)
                              setJoinActivityId(activity._id);
                          }}
                        />
                      );
                    })}
                  </div>
                </section>
              )}
            </>
          )}

          <FeedbackSection />
        </div>
      </main>
    </div>
  );
}

function FeedbackSection() {
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);
  const { mutate: sendFeedback, isPending } = useSendFeedback();

  const handleSubmit = () => {
    if (!message.trim()) return;
    sendFeedback(message, {
      onSuccess: () => {
        setSent(true);
        setMessage("");
      },
    });
  };

  return (
    <div className="mt-8 mb-4 bg-white rounded-2xl border border-[#f1f5f9] px-4 py-4">
      <div className="flex items-center gap-2 mb-1">
        <span
          className="material-symbols-outlined text-[#e2cfb7]"
          style={{ fontSize: 18 }}
        >
          rate_review
        </span>
        <h3 className="text-[14px] font-bold text-[#1e293b]">Send Feedback</h3>
      </div>
      <p className="text-[12px] text-[#64748b] mb-3">
        Help us improve PawFriends — share your thoughts or report issues.
      </p>

      {sent ? (
        <div className="flex items-center gap-2 py-3 justify-center">
          <span
            className="material-symbols-outlined text-green-500"
            style={{ fontSize: 18 }}
          >
            check_circle
          </span>
          <p className="text-[13px] font-semibold text-green-600">
            Thanks for your feedback!
          </p>
        </div>
      ) : (
        <>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="What's on your mind?"
            rows={3}
            className="w-full rounded-xl border border-[rgba(226,207,183,0.4)] bg-[#f8fafc] px-4 py-3 text-[14px] text-[#1e293b] placeholder-[#94a3b8] outline-none focus:border-[#e2cfb7] resize-none leading-relaxed"
          />
          <button
            onClick={handleSubmit}
            disabled={!message.trim() || isPending}
            className="mt-3 w-full h-11 rounded-xl bg-[#1e293b] text-white text-[13px] font-bold flex items-center justify-center gap-2 disabled:opacity-30"
          >
            <span
              className="material-symbols-outlined"
              style={{ fontSize: 16 }}
            >
              send
            </span>
            {isPending ? "Sending…" : "Send Feedback"}
          </button>
        </>
      )}
    </div>
  );
}

function SearchAndFilters({
  search,
  setSearch,
  activeFilter,
  setActiveFilter,
}: {
  search: string;
  setSearch: (v: string) => void;
  activeFilter: Filter;
  setActiveFilter: (f: Filter) => void;
}) {
  return (
    <div className="flex flex-col gap-2">
      <label className="relative flex items-center w-full">
        <span
          className="material-symbols-outlined absolute left-3 text-[#94a3b8]"
          style={{ fontSize: 18 }}
        >
          search
        </span>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search activities..."
          className="w-full h-11 pl-10 pr-4 bg-white rounded-xl text-sm text-[#1e293b] placeholder-[#94a3b8] outline-none focus:ring-2 focus:ring-[#e2cfb7]"
        />
      </label>
      <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setActiveFilter(f)}
            className={`flex h-8 shrink-0 items-center gap-1 rounded-full px-3 text-[12px] font-semibold transition-colors ${
              activeFilter === f
                ? "bg-[#e2cfb7] text-[#1e293b]"
                : "bg-white text-[#475569] border border-[#f1f5f9]"
            }`}
          >
            {f === "Nearby" && (
              <span
                className="material-symbols-outlined"
                style={{ fontSize: 14 }}
              >
                near_me
              </span>
            )}
            {f === "Today" && (
              <span
                className="material-symbols-outlined"
                style={{ fontSize: 14 }}
              >
                calendar_today
              </span>
            )}
            {f}
          </button>
        ))}
      </div>
    </div>
  );
}
