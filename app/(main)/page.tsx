"use client";

import { useState } from "react";
import ActivityCard from "@/components/ActivityCard";
import {
  PetSizeCategory,
  useActivities,
  useCreateAttendees,
  useProfile,
  useSendFeedback,
} from "@/lib/queries";
import { ACTIVITY_TYPE_BADGE, formatStartTim } from "@/lib/constants";
import Image from "next/image";
import SpinLoader from "@/components/SpinLoader";
import RequestModal from "@/components/RequestModal";
import { useRouter } from "next/navigation";

const FILTERS = ["All Activities", "Nearby", "Today", "Playdates"] as const;
type Filter = (typeof FILTERS)[number];

export default function HomePage() {
  const router = useRouter();
  const [activeFilter, setActiveFilter] = useState<Filter>("All Activities");
  const [search, setSearch] = useState("");
  const [joinActivityId, setJoinActivityId] = useState<string | null>(null);

  const { data: allProfiles, isPending: isUserPending } = useProfile();
  const { data: activities, isFetching: isActivitiesFetching } =
    useActivities();
  const { mutate: createAttendee } = useCreateAttendees();

  if (isUserPending || isActivitiesFetching || isActivitiesFetching)
    return <SpinLoader title="Loading home" />;

  return (
    <div className="flex min-h-dvh bg-[#f7f7f6] w-full">
      {/* ── Main column ── */}
      <div className="flex flex-col flex-1 min-w-0">
        {/* Mobile sticky header */}
        <header className="md:hidden sticky top-0 bg-[#f7f7f6]/80 backdrop-blur-md px-4 pt-4 pb-2 z-20">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#e2cfb7] flex items-center justify-center overflow-hidden">
                <Image
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuAsSKRt5tFy-1BdBd4c_QRh6ksE4CZDV0XfAuYzvyfEvfZwKt3ipjDz_96uK0F5JXnwzbli6DZCBn6ubCqtlyarVRtAsSfyBQzrkJUbDCzA4_R9rPAvq-HzHdpzQ8Xo2bCsR9JqsMxTHHikPqmmcpqxdxUE-Nw7uwmiYS6XZqyr-5vD5r0LSH6PAGrpNZ8-gaUl6lFCbIk3WFnSlQLaBTr3GJ9HSwidqH48VPhHSUt1HCGPB8sSyZYMYUkPufAwmJgT0Tjr5_5eudTZ"
                  width={1098}
                  height={1098}
                  alt="Dog profile"
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <h1 className="text-[17px] font-bold leading-tight text-[#1e293b]">
                  PawFriends
                </h1>
                <div className="flex items-center text-xs text-[#64748b]">
                  <span
                    className="material-symbols-outlined mr-1"
                    style={{ fontSize: 14 }}
                  >
                    location_on
                  </span>
                  <span className="text-ellipsis overflow-hidden text-wrap">
                    {allProfiles?.user?.locationName}
                  </span>
                </div>
              </div>
            </div>
            <button className="w-10 h-10 rounded-full flex items-center justify-center bg-[rgba(226,207,183,0.2)] hover:bg-[rgba(226,207,183,0.4)] transition-colors">
              <span className="material-symbols-outlined text-[#1e293b]">
                notifications
              </span>
            </button>
          </div>
          <SearchAndFilters
            search={search}
            setSearch={setSearch}
            activeFilter={activeFilter}
            setActiveFilter={setActiveFilter}
          />
        </header>

        {/* Desktop top bar */}
        <header className="hidden md:flex items-center gap-4 px-6 py-4 border-b border-[#ede8e0] bg-[#f7f7f6]/80 backdrop-blur-md sticky top-0 z-20">
          <div className="flex-1">
            <SearchAndFilters
              search={search}
              setSearch={setSearch}
              activeFilter={activeFilter}
              setActiveFilter={setActiveFilter}
            />
          </div>
          <div className="flex gap-3 shrink-0 h-full items-center md:items-baseline">
            <div className="flex items-center text-sm text-[#64748b]">
              <span
                className="material-symbols-outlined mr-1"
                style={{ fontSize: 16 }}
              >
                location_on
              </span>
              <span className="text-ellipsis whitespace-nowrap overflow-hidden w-20">
                {allProfiles?.user?.locationName}
              </span>
            </div>
            <button className="w-10 h-10 rounded-full flex items-center justify-center bg-[rgba(226,207,183,0.2)] hover:bg-[rgba(226,207,183,0.4)] transition-colors">
              <span className="material-symbols-outlined text-[#1e293b]">
                notifications
              </span>
            </button>
          </div>
        </header>

        {/* Feed */}
        <main className="flex-1 px-4 md:px-6 py-4 pb-24 md:pb-8">
          {/* Compatibility CTA */}
          {/* <button
            className="w-full flex items-center justify-between bg-[#e2cfb7] hover:opacity-90 text-[#1e293b] p-4 rounded-xl shadow-sm transition-opacity mb-6"
            onClick={() => {
              window.location.href = "/compatibility";
            }}
          >
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-2xl">
                shield_with_heart
              </span>
              <span className="font-bold text-[15px]">
                View Compatibility Results
              </span>
            </div>
            <span className="material-symbols-outlined">chevron_right</span>
          </button> */}

          <h2 className="text-xl font-bold tracking-tight text-[#1e293b] mb-4">
            Upcoming Activities
          </h2>

          {/* Empty state */}
          {(!activities || activities.length === 0) && (
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
                className="mt-2 bg-[#1e293b] text-white font-bold text-[14px] px-6 py-3 rounded-xl flex items-center gap-2 hover:opacity-90 transition-opacity"
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

          {/* Mobile: stacked / Desktop: 2-col grid */}
          {activities && activities.length > 0 && (
            <>
              <RequestModal
                open={!!joinActivityId}
                pets={allProfiles?.pets ?? []}
                activityType={
                  activities.find((a) => a._id === joinActivityId)?.type
                }
                activitySizes={
                  activities.find((a) => a._id === joinActivityId)?.sizes
                }
                onConfirm={(selectedId, message) => {
                  if (!joinActivityId) return;
                  const activity = activities.find(
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
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {activities.map((activity) => {
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
                        activity.amountOfAttendees - activity.attendees.length
                      }
                      hostAvatar={activity.owner.image}
                      hostName={activity.owner.name}
                      description={activity.description}
                      isOwner={allProfiles?.user?._id === activity?.owner?._id}
                      isExpired={
                        !!activity.endDate &&
                        new Date(activity.endDate) < new Date()
                      }
                      isDisableRequest={
                        activity.hostType !== "business" &&
                        !!allProfiles &&
                        allProfiles.pets.length > 0 &&
                        allProfiles.pets.every((pet) =>
                          activity.attendees?.some((a) => a.name === pet.name),
                        )
                      }
                      onJoin={() => {
                        if (activity.hostType === "business") {
                          router.push(`/activity/${activity._id}`);
                          return;
                        }
                        if (allProfiles && allProfiles.pets.length > 0)
                          setJoinActivityId(activity._id);
                      }}
                    />
                  );
                })}
              </div>
            </>
          )}
          <FeedbackSection />
        </main>
      </div>
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
    <div className="mt-10 mb-4 bg-white rounded-2xl border border-[#f1f5f9] px-5 py-5">
      <div className="flex items-center gap-2 mb-1">
        <span
          className="material-symbols-outlined text-[#e2cfb7]"
          style={{ fontSize: 20 }}
        >
          rate_review
        </span>
        <h3 className="text-[15px] font-bold text-[#1e293b]">Send Feedback</h3>
      </div>
      <p className="text-[12px] text-[#64748b] mb-3">
        Help us improve PawFriends — share your thoughts, ideas, or report
        issues.
      </p>

      {sent ? (
        <div className="flex items-center gap-2 py-4 justify-center">
          <span
            className="material-symbols-outlined text-green-500"
            style={{ fontSize: 20 }}
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
            className="w-full rounded-xl border border-[rgba(226,207,183,0.4)] bg-[#f8fafc] px-4 py-3 text-[14px] text-[#1e293b] placeholder-[#94a3b8] outline-none focus:border-[#e2cfb7] focus:ring-2 focus:ring-[rgba(226,207,183,0.2)] resize-none leading-relaxed"
          />
          <button
            onClick={handleSubmit}
            disabled={!message.trim() || isPending}
            className="mt-3 w-full h-11 rounded-xl bg-[#1e293b] text-white text-[13px] font-bold flex items-center justify-center gap-2 hover:opacity-90 disabled:opacity-30 transition-all"
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
    <div className="flex flex-col gap-3">
      <label className="relative flex items-center w-full">
        <span
          className="material-symbols-outlined absolute left-4 text-[#94a3b8]"
          style={{ fontSize: 20 }}
        >
          search
        </span>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search activities, breeds, or parks..."
          className="w-full h-12 pl-11 pr-4 bg-white border-none rounded-xl text-sm text-[#1e293b] placeholder-[#94a3b8] outline-none focus:ring-2 focus:ring-[#e2cfb7]"
        />
      </label>
      <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setActiveFilter(f)}
            className={`flex h-9 shrink-0 items-center justify-center gap-1.5 rounded-full px-4 text-sm font-semibold transition-colors ${
              activeFilter === f
                ? "bg-[#e2cfb7] text-[#1e293b]"
                : "bg-white text-[#475569] border border-[#f1f5f9]"
            }`}
          >
            {f === "Nearby" && (
              <span
                className="material-symbols-outlined"
                style={{ fontSize: 16 }}
              >
                near_me
              </span>
            )}
            {f === "Today" && (
              <span
                className="material-symbols-outlined"
                style={{ fontSize: 16 }}
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
