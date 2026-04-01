"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import dayjs from "dayjs";
import {
  Activity,
  Attendee,
  Pet,
  PetSizeCategory,
  useActivity,
  useCreateAttendees,
  useEndActivity,
  usePauseActivity,
  useProfile,
  useUpdateAttendee,
} from "@/lib/queries";
import SpinLoader from "@/components/SpinLoader";
import RequestModal from "@/components/RequestModal";
import { useToast } from "@/components/Toast";
import clsx from "clsx";
import Tooltip from "@/components/Tooltip";
import ConfirmModal from "@/components/ConfirmModal";
import DateRangeCalendar from "@/components/DateRangeCalendar";
import AttendeeGrid from "@/components/activity/AttendeeGrid";

const FALLBACK_AVATAR =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuBuzALWachO_YIj8n2rR-FLfaEYVj3LhYbo9hEjMEUR56kinTG63BRNgCKCr2UY94D71unYWxE4HXlvQwfOO6iH5U14SS6xGwZ_t0JPr2LaSWERa91zC5xmVFEP1EPhKdJ8RdW5EyNIgXqHO7I6fzubsaAgzj3wVnSlk40Xx5Gytefc7WB8s58QJOPu9U94Y_MWJX_HM2WRhjYJkQs6lMuDySUnFmGBw_Wn7XDJFOAxscL2Izuf3UznPYuNQVRv0x5nqBzhRT1i-uJ3";

const SIZE_LABEL: { [key in PetSizeCategory]: string } = {
  XS: "Very Small",
  SM: "Small",
  MD: "Medium",
  LG: "Large",
  XL: "Super Large",
};

const HOST_TYPE_LABEL: Record<string, { icon: string; label: string }> = {
  personal: { icon: "🐾", label: "Personal" },
  business: { icon: "🏪", label: "Business" },
};

/* ── helpers ── */
function groupPetRequirements(reqs: string[]) {
  const genetic: string[] = [];
  const personality: string[] = [];
  const other: string[] = [];
  for (const req of reqs) {
    if (req.startsWith("genetic:")) genetic.push(req.slice("genetic:".length));
    else if (req.startsWith("personality:"))
      personality.push(req.slice("personality:".length));
    else other.push(req);
  }
  return { genetic, personality, other };
}

/* ── Love requirements display ── */
function LoveRequirementsGroup({
  title,
  icon,
  items,
  chipClass,
}: {
  title: string;
  icon: string;
  items: string[];
  chipClass: string;
}) {
  if (items.length === 0) return null;
  return (
    <div>
      <div className="flex items-center gap-1.5 mb-2">
        <span
          className="material-symbols-outlined text-rose-400"
          style={{ fontSize: 15 }}
        >
          {icon}
        </span>
        <p className="text-[11px] font-bold text-rose-500 uppercase tracking-wider">
          {title}
        </p>
      </div>
      <div className="flex flex-wrap gap-2">
        {items.map((item) => (
          <span
            key={item}
            className={clsx(
              "px-3 py-1 rounded-full text-[12px] font-semibold",
              chipClass,
            )}
          >
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}

export default function ActivityDetailPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();

  const { data: allProfiles } = useProfile();
  const { data: activity, isFetching } = useActivity(id);
  const { mutate: endedActivity } = useEndActivity(id);
  const { mutate: pauseActivity } = usePauseActivity(id);
  const isHost = allProfiles?.user?._id === activity?.owner._id;
  const isLove = activity?.type === "love";

  const [joinActivityId, setJoinActivityId] = useState<string | null>(null);
  const [showRequests, setShowRequests] = useState(false);

  const requestAttendees =
    activity?.attendees.filter((a) => a.status !== "joined") ?? [];

  useEffect(() => {
    if (activity?.status === "ended") router.push("/");
  }, [activity?.status, router]);

  const isAllPetJoined =
    !!allProfiles &&
    allProfiles.pets.length > 0 &&
    allProfiles.pets.every((pet) =>
      activity?.attendees?.some(
        (a) => a.name === pet.name && a.status === "joined",
      ),
    );

  const isAnyPetPending =
    !!allProfiles &&
    allProfiles.pets.some((pet) =>
      activity?.attendees?.some(
        (a) => a.name === pet.name && a.status === "pending",
      ),
    );

  if (isFetching) return <SpinLoader title="Loading activity" />;

  const actionPanel = isHost ? (
    <HostActions
      attendees={requestAttendees}
      allAttendees={activity?.attendees ?? []}
      activityId={id}
      showRequests={showRequests}
      setShowRequests={setShowRequests}
      onEnded={() => endedActivity()}
      onPaused={() => pauseActivity()}
      isLove={isLove}
      isBusiness={activity?.hostType === "business"}
    />
  ) : (
    <UserAction
      joinActivityId={joinActivityId}
      setJoinActivityId={setJoinActivityId}
      activity={activity}
      pets={allProfiles?.pets ?? []}
      isJoined={isAllPetJoined}
      isPending={isAnyPetPending}
      isLove={isLove}
      isDisable={!activity || !allProfiles || allProfiles.pets.length <= 0}
      onAttendeeJoin={() => {
        if (activity && allProfiles && allProfiles.pets.length > 0)
          setJoinActivityId(activity._id);
      }}
    />
  );

  /* ── Pet requirements renderer ── */
  const petRequirementsBlock = (mobile: boolean) => {
    if (!activity?.petRequirements?.length) return null;

    if (isLove) {
      const { genetic, personality } = groupPetRequirements(
        activity.petRequirements,
      );
      return (
        <div
          className={
            mobile
              ? "px-4 py-6 border-t border-rose-100"
              : "rounded-2xl border border-rose-200 bg-white px-5 py-5 mb-6"
          }
        >
          <div className="flex items-center gap-2 mb-4">
            <span className="text-lg">💝</span>
            <h3
              className={clsx(
                "font-bold text-rose-600",
                mobile ? "text-[18px]" : "text-[17px]",
              )}
            >
              Match Requirements
            </h3>
          </div>
          <div className="flex flex-col gap-4">
            <LoveRequirementsGroup
              title="Genetic Information"
              icon="genetics"
              items={genetic}
              chipClass="bg-rose-50 border border-rose-200 text-rose-700"
            />
            <LoveRequirementsGroup
              title="Personality Traits"
              icon="psychology"
              items={personality}
              chipClass="bg-purple-50 border border-purple-200 text-purple-700"
            />
          </div>
        </div>
      );
    }

    return (
      <div
        className={
          mobile
            ? "px-4 py-6 border-t border-[rgba(226,207,183,0.2)]"
            : "bg-white rounded-2xl border border-[#f1f5f9] px-5 py-5 mb-6"
        }
      >
        <h3
          className={clsx(
            "font-bold text-[#1e293b] mb-3",
            mobile ? "text-[18px]" : "text-[17px]",
          )}
        >
          Pet Requirements
        </h3>
        <div className="flex flex-col gap-2">
          {activity.petRequirements.map((req) => (
            <div key={req} className="flex items-center gap-2.5">
              <span
                className="material-symbols-outlined text-[#e2cfb7]"
                style={{ fontSize: 16 }}
              >
                check_circle
              </span>
              <p className="text-[14px] font-semibold text-[#334155]">{req}</p>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div
      className={clsx("flex flex-col flex-1 min-w-0 min-h-dvh bg-[#f7f7f6]")}
    >
      {/* Top nav bar */}
      <div
        className={clsx(
          "flex items-center justify-between px-4 md:px-8 py-3 border-b sticky top-0 z-10",
          isLove
            ? "border-rose-200/40 bg-rose-50"
            : "border-[rgba(225,207,183,0.2)] bg-[#f7f7f6]",
        )}
      >
        <button
          className={clsx(
            "w-10 h-10 flex items-center justify-center rounded-xl transition-colors",
            isLove ? "hover:bg-rose-100" : "hover:bg-[rgba(226,207,183,0.2)]",
          )}
          onClick={() => router.back()}
        >
          <span
            className={clsx(
              "material-symbols-outlined",
              isLove ? "text-rose-500" : "text-[#1e293b]",
            )}
          >
            arrow_back
          </span>
        </button>
        <h2
          className={clsx(
            "text-[17px] font-bold md:text-xl tracking-tight text-center w-full",
            isLove ? "text-rose-600" : "text-[#1e293b]",
          )}
        >
          {isLove ? "💕 Love Match" : "Activity Details"}
        </h2>
      </div>

      {/* ── Mobile layout ── */}
      <div className="md:hidden flex-1 overflow-y-auto pb-32">
        <ActivityContent activity={activity} isLove={isLove} />
        {petRequirementsBlock(true)}
        {/* Attendees mobile */}
        <div
          className={clsx(
            "px-4 py-6 border-t",
            isLove ? "border-rose-100" : "border-[rgba(226,207,183,0.2)]",
          )}
        >
          <h3
            className={clsx(
              "text-[18px] font-bold mb-4",
              isLove ? "text-rose-600" : "text-[#1e293b]",
            )}
          >
            {isLove
              ? "💕 Matched Pups"
              : `Attendees (${activity?.attendees?.length ?? 0})`}
            {isLove && (
              <span className="text-[#94a3b8] font-normal text-[14px] ml-2">
                ({activity?.attendees?.length ?? 0})
              </span>
            )}
          </h3>
          <AttendeeGrid attendees={activity?.attendees ?? []} isLove={isLove} />
        </div>
        <div
          className={clsx(
            "w-full max-w-107.5 p-4 backdrop-blur-md border-t",
            isLove
              ? "bg-rose-50/80 border-rose-200/40"
              : "bg-[#f7f7f6]/80 border-[rgba(226,207,183,0.3)]",
          )}
        >
          {actionPanel}
        </div>
      </div>

      {/* ── Desktop layout ── */}
      <div className="hidden md:flex flex-1 gap-8 px-8 py-8 max-w-5xl mx-auto w-full items-start">
        {/* Left column */}
        <div className="flex-1 min-w-0 flex flex-col gap-0">
          {/* Hero images */}
          <HeroCarousel
            images={
              activity?.images?.length
                ? activity.images
                : activity?.image
                  ? [activity.image]
                  : []
            }
            isLove={isLove}
            className={clsx(
              "w-full h-80 rounded-2xl mb-6",
              isLove && "ring-2 ring-rose-200",
            )}
          />

          {/* Title & badges */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-2">
              {isLove ? (
                <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-rose-100 border border-rose-200 text-[11px] font-bold text-rose-600">
                  💕 Love Match
                </span>
              ) : (
                activity?.hostType &&
                HOST_TYPE_LABEL[activity.hostType] && (
                  <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-[rgba(226,207,183,0.3)] text-[11px] font-bold text-[#64748b]">
                    {HOST_TYPE_LABEL[activity.hostType].icon}{" "}
                    {HOST_TYPE_LABEL[activity.hostType].label}
                  </span>
                )
              )}
              {activity?.hostType === "business" &&
                activity.autoEnd === false && (
                  <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#f0fdf4] border border-green-200 text-[11px] font-bold text-green-700">
                    <span
                      className="material-symbols-outlined"
                      style={{ fontSize: 12 }}
                    >
                      schedule
                    </span>
                    Manual End
                  </span>
                )}
            </div>
            <h1
              className={clsx(
                "text-3xl font-bold tracking-tight mb-3",
                isLove ? "text-rose-700" : "text-[#1e293b]",
              )}
            >
              {activity?.title}
            </h1>
            {!isLove && (
              <div className="flex flex-wrap gap-2">
                {activity?.sizes.map((key) => (
                  <span
                    key={key}
                    className="bg-[rgba(226,207,183,0.4)] text-[#334155] px-3 py-1 rounded-full text-[11px] font-semibold uppercase tracking-wider"
                  >
                    {SIZE_LABEL[key]} Dogs
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Location & date */}
          <div
            className={clsx(
              "rounded-2xl overflow-hidden mb-6 divide-y",
              isLove
                ? "bg-white border border-rose-200 divide-rose-100"
                : "bg-white border border-[#f1f5f9] divide-[#f1f5f9]",
            )}
          >
            <div className="flex items-center gap-4 px-5 py-4 hover:bg-[rgba(226,207,183,0.06)] transition-colors cursor-pointer">
              <div
                className={clsx(
                  "w-11 h-11 flex items-center justify-center rounded-xl shrink-0",
                  isLove ? "bg-rose-100" : "bg-[rgba(226,207,183,0.3)]",
                )}
              >
                <span
                  className={clsx(
                    "material-symbols-outlined",
                    isLove ? "text-rose-500" : "text-[#1e293b]",
                  )}
                >
                  location_on
                </span>
              </div>
              <div className="flex-1">
                <p className="text-[15px] font-semibold text-[#1e293b] truncate text-ellipsis whitespace-nowrap overflow-hidden w-80">
                  {activity?.locationName}
                </p>
              </div>
              <span className="material-symbols-outlined text-[#94a3b8]">
                chevron_right
              </span>
            </div>
            {activity?.startDate && (
              <div className="flex items-center gap-4 px-5 py-4">
                <div
                  className={clsx(
                    "w-11 h-11 flex items-center justify-center rounded-xl shrink-0",
                    isLove ? "bg-rose-100" : "bg-[rgba(226,207,183,0.3)]",
                  )}
                >
                  <span
                    className={clsx(
                      "material-symbols-outlined",
                      isLove ? "text-rose-500" : "text-[#1e293b]",
                    )}
                  >
                    calendar_today
                  </span>
                </div>
                <div>
                  <p className="text-[15px] font-semibold text-[#1e293b]">
                    {dayjs(activity?.startDate).format("dddd, MMM D")}
                  </p>
                  <p className="text-[13px] text-[#64748b]">
                    {isLove
                      ? "All day appointment"
                      : `${dayjs(activity?.startDate).format("hh:mm A")} – ${dayjs(activity?.endDate).format("hh:mm A")}`}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* About */}
          <div
            className={clsx(
              "rounded-2xl px-5 py-5 mb-6",
              isLove
                ? "bg-white border border-rose-200"
                : "bg-white border border-[#f1f5f9]",
            )}
          >
            <h3
              className={clsx(
                "text-[17px] font-bold mb-2",
                isLove ? "text-rose-600" : "text-[#1e293b]",
              )}
            >
              {isLove ? "💌 About This Match" : "About the Activity"}
            </h3>
            <p className="text-[15px] text-[#475569] leading-relaxed whitespace-pre-wrap">
              {activity?.description}
            </p>
          </div>

          {/* Pet Requirements */}
          {petRequirementsBlock(false)}

          {/* Attendees */}
          <div
            className={clsx(
              "rounded-2xl px-5 py-5",
              isLove
                ? "bg-white border border-rose-200"
                : "bg-white border border-[#f1f5f9]",
            )}
          >
            <div className="flex items-center justify-between mb-4">
              <h3
                className={clsx(
                  "text-[17px] font-bold",
                  isLove ? "text-rose-600" : "text-[#1e293b]",
                )}
              >
                {isLove
                  ? "💕 Matched Pups"
                  : `Attendees (${activity?.attendees?.length ?? 0})`}
                {isLove && (
                  <span className="text-[#94a3b8] font-normal text-[14px] ml-2">
                    ({activity?.attendees?.length ?? 0})
                  </span>
                )}
              </h3>
            </div>
            <AttendeeGrid
              attendees={activity?.attendees ?? []}
              isLove={isLove}
            />
          </div>
        </div>

        {/* Right column: sticky action panel */}
        <div className="w-80 shrink-0 sticky top-20">
          <div
            className={clsx(
              "rounded-2xl overflow-hidden",
              isLove
                ? "bg-white border border-rose-200"
                : "bg-white border border-[#f1f5f9]",
            )}
          >
            <div
              className={clsx(
                "px-5 py-4 border-b",
                isLove ? "border-rose-100" : "border-[#f1f5f9]",
              )}
            >
              <h3
                className={clsx(
                  "text-[16px] font-bold",
                  isLove ? "text-rose-600" : "text-[#1e293b]",
                )}
              >
                {isHost
                  ? isLove
                    ? "💕 Manage Match"
                    : "Manage Activity"
                  : isLove
                    ? "💕 Request a Date"
                    : "Join this Activity"}
              </h3>
              <p className="text-[13px] text-[#64748b] mt-0.5">
                {isHost
                  ? "Review requests and end activity"
                  : `${activity?.attendees.length} of ${activity?.amountOfAttendees ?? 0} spots filled`}
              </p>
            </div>

            {/* Attendee stack preview */}
            <div
              className={clsx(
                "px-5 py-4 border-b",
                isLove ? "border-rose-100" : "border-[#f1f5f9]",
              )}
            >
              <div className="flex items-center gap-2">
                <AttendeeGrid
                  attendees={activity?.attendees?.slice(0, 3) ?? []}
                  isLove={isLove}
                  size="sm"
                />
                <p className="text-[13px] text-[#475569]">
                  <span className="font-bold text-[#1e293b]">
                    {activity?.attendees?.length} pups
                  </span>{" "}
                  {isLove ? "looking for love" : "already joined"}
                </p>
              </div>
            </div>

            <div className="px-5 py-5">{actionPanel}</div>
          </div>

          {/* Host info card */}
          <div
            className={clsx(
              "rounded-2xl px-5 py-4 mt-4 flex items-center gap-3",
              isLove
                ? "bg-white border border-rose-200"
                : "bg-white border border-[#f1f5f9]",
            )}
          >
            <Image
              src={activity?.owner.image ?? FALLBACK_AVATAR}
              alt="Host"
              className="w-10 h-10 rounded-full object-cover shrink-0"
              width={64}
              height={64}
            />
            <div className="flex-1 min-w-0">
              <p className="text-[13px] text-[#64748b]">
                {isLove ? "Posted by" : "Hosted by"}
              </p>
              <p className="text-[14px] font-bold text-[#1e293b] truncate">
                {activity?.owner.name}
              </p>
            </div>
            {!isHost && (
              <button
                onClick={() => router.push(`/profile/${activity?.owner._id}`)}
                className="text-[13px] font-semibold text-[#64748b] hover:text-[#1e293b] transition-colors shrink-0"
              >
                View Profile
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Hero image carousel ── */
function HeroCarousel({
  images,
  isLove,
  className,
}: {
  images: (File | string)[];
  isLove?: boolean;
  className?: string;
}) {
  const [index, setIndex] = useState(0);
  if (!images.length) return null;
  return (
    <div className={clsx("relative overflow-hidden", className)}>
      <div
        className="w-full h-full bg-center bg-cover bg-no-repeat transition-all duration-300"
        style={{
          backgroundImage: `url("${images[index]}")`,
          minHeight: "inherit",
          height: "inherit",
        }}
      >
        {isLove && (
          <div className="absolute inset-0 bg-gradient-to-t from-rose-900/30 to-transparent" />
        )}
      </div>
      {images.length > 1 && (
        <>
          <button
            type="button"
            onClick={() =>
              setIndex((i) => (i - 1 + images.length) % images.length)
            }
            className="absolute left-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/50 transition"
          >
            <span
              className="material-symbols-outlined"
              style={{ fontSize: 16 }}
            >
              chevron_left
            </span>
          </button>
          <button
            type="button"
            onClick={() => setIndex((i) => (i + 1) % images.length)}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/50 transition"
          >
            <span
              className="material-symbols-outlined"
              style={{ fontSize: 16 }}
            >
              chevron_right
            </span>
          </button>
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
            {images.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setIndex(i)}
                className={clsx(
                  "rounded-full transition-all",
                  i === index
                    ? "w-4 h-1.5 bg-white"
                    : "w-1.5 h-1.5 bg-white/50",
                )}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

/* ── Mobile activity content ── */
function ActivityContent({
  activity,
  isLove,
}: {
  activity?: Activity;
  isLove?: boolean;
}) {
  return (
    <div>
      {/* Hero images */}
      <HeroCarousel
        images={
          activity?.images?.length
            ? activity.images
            : activity?.image
              ? [activity.image]
              : []
        }
        isLove={isLove}
        className="relative w-full min-h-72"
      />

      {/* Title & badges */}
      <div className="px-4 py-6">
        <div className="flex items-center gap-2 mb-2">
          {isLove ? (
            <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-rose-100 border border-rose-200 text-[11px] font-bold text-rose-600">
              💕 Love Match
            </span>
          ) : (
            activity?.hostType &&
            HOST_TYPE_LABEL[activity.hostType] && (
              <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-[rgba(226,207,183,0.3)] text-[11px] font-bold text-[#64748b]">
                {HOST_TYPE_LABEL[activity.hostType].icon}{" "}
                {HOST_TYPE_LABEL[activity.hostType].label}
              </span>
            )
          )}
          {activity?.hostType === "business" && activity.autoEnd === false && (
            <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#f0fdf4] border border-green-200 text-[11px] font-bold text-green-700">
              <span
                className="material-symbols-outlined"
                style={{ fontSize: 12 }}
              >
                schedule
              </span>
              Manual End
            </span>
          )}
        </div>
        <h1
          className={clsx(
            "text-3xl font-bold tracking-tight pb-2",
            isLove ? "text-rose-700" : "text-[#1e293b]",
          )}
        >
          {activity?.title}
        </h1>
        {!isLove && (
          <div className="flex flex-wrap gap-2">
            {activity?.sizes.map((key) => (
              <span
                key={key}
                className="bg-[rgba(226,207,183,0.4)] text-[#334155] px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider"
              >
                {SIZE_LABEL[key]} Dogs
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Location & date */}
      <div
        className={clsx(
          "space-y-1 border-t",
          isLove ? "border-rose-100" : "border-[rgba(226,207,183,0.2)]",
        )}
      >
        <div className="flex items-center gap-4 px-4 py-4 justify-between hover:bg-[rgba(226,207,183,0.08)] cursor-pointer transition-colors">
          <div className="flex items-center gap-4">
            <div
              className={clsx(
                "w-12 h-12 flex items-center justify-center rounded-xl shrink-0",
                isLove ? "bg-rose-100" : "bg-[rgba(226,207,183,0.3)]",
              )}
            >
              <span
                className={clsx(
                  "material-symbols-outlined",
                  isLove ? "text-rose-500" : "text-[#1e293b]",
                )}
              >
                location_on
              </span>
            </div>
            <div>
              <p className="text-[15px] font-semibold text-[#1e293b] text-ellipsis whitespace-nowrap overflow-hidden w-60">
                {activity?.locationName}
              </p>
            </div>
          </div>
          <span className="material-symbols-outlined text-[#94a3b8]">
            chevron_right
          </span>
        </div>

        <div className="flex items-center gap-4 px-4 py-4">
          <div
            className={clsx(
              "w-12 h-12 flex items-center justify-center rounded-xl shrink-0",
              isLove ? "bg-rose-100" : "bg-[rgba(226,207,183,0.3)]",
            )}
          >
            <span
              className={clsx(
                "material-symbols-outlined",
                isLove ? "text-rose-500" : "text-[#1e293b]",
              )}
            >
              calendar_today
            </span>
          </div>
          <div>
            <p className="text-[15px] font-semibold text-[#1e293b]">
              {dayjs(activity?.startDate).format("dddd, MMM D")}
            </p>
            <p className="text-[13px] text-[#64748b]">
              {isLove
                ? "All day appointment"
                : `${dayjs(activity?.startDate).format("hh:mm A")} – ${dayjs(activity?.endDate).format("hh:mm A")}`}
            </p>
          </div>
        </div>
      </div>

      {/* About */}
      <div
        className={clsx(
          "px-4 py-6 border-t",
          isLove ? "border-rose-100" : "border-[rgba(226,207,183,0.2)]",
        )}
      >
        <h3
          className={clsx(
            "text-[18px] font-bold mb-2",
            isLove ? "text-rose-600" : "text-[#1e293b]",
          )}
        >
          {isLove ? "💌 About This Match" : "About the Activity"}
        </h3>
        <p className="text-[15px] text-[#475569] leading-relaxed whitespace-pre-wrap">
          {activity?.description}
        </p>
      </div>
    </div>
  );
}

/* ── User action ── */
function UserAction({
  joinActivityId,
  activity,
  pets,
  isJoined,
  isPending,
  isLove,
  isDisable,
  setJoinActivityId,
  onAttendeeJoin,
}: {
  joinActivityId: string | null;
  activity?: Activity;
  pets: Pet[];
  isJoined: boolean;
  isPending?: boolean;
  isLove?: boolean;
  isDisable?: boolean;
  setJoinActivityId: (open: string | null) => void;
  onAttendeeJoin: () => void;
}) {
  const { mutate: createAttendee } = useCreateAttendees();
  const [selectedStartDate, setSelectedStartDate] = useState("");
  const [selectedEndDate, setSelectedEndDate] = useState("");
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null);

  const attendeesByDate: Record<string, { image: string; name: string }[]> = {};
  (activity?.attendees ?? []).forEach((a) => {
    (a.dateRanges ?? []).forEach((range) => {
      if (!range.startDate) return;
      const start = dayjs(range.startDate).startOf("day");
      const end = range.endDate ? dayjs(range.endDate).startOf("day") : start;
      let current = start;
      while (!current.isAfter(end)) {
        const dateKey = current.format("YYYY-MM-DD");
        if (!attendeesByDate[dateKey]) attendeesByDate[dateKey] = [];
        attendeesByDate[dateKey].push({ image: a.image, name: a.name });
        current = current.add(1, "day");
      }
    });
  });

  const isPersonal = activity?.hostType === "personal";
  const isBusiness = activity?.hostType === "business";
  const joinedCount =
    activity?.attendees?.filter((a) => a.status === "joined").length ?? 0;
  const isFull = !!activity?.maxDogs && joinedCount >= activity.maxDogs;
  const hasSelectedDate = isPersonal || !!selectedStartDate;

  // For business: check if any of the user's pets already have a booking overlapping the selected slot
  const isSlotAlreadyBooked =
    isBusiness &&
    !!selectedStartDate &&
    pets.some((pet) =>
      activity?.attendees?.some((a) => {
        if (a.attendeeId !== pet._id) return false;
        const selStart = dayjs(selectedStartDate).startOf("day");
        const selEnd = selectedEndDate
          ? dayjs(selectedEndDate).startOf("day")
          : selStart;
        return (a.dateRanges ?? []).some((range) => {
          if (!range.startDate) return false;
          const aStart = dayjs(range.startDate).startOf("day");
          const aEnd = range.endDate
            ? dayjs(range.endDate).startOf("day")
            : aStart;
          // overlap: neither range ends before the other starts
          return !aEnd.isBefore(selStart) && !aStart.isAfter(selEnd);
        });
      }),
    );

  // Business allows multiple bookings; personal/other types block on isJoined
  const effectiveIsJoined = isBusiness ? false : isJoined;
  const effectiveIsPending = isBusiness ? false : isPending;

  const buttonDisabled =
    isDisable ||
    !hasSelectedDate ||
    isFull ||
    effectiveIsPending ||
    effectiveIsJoined ||
    isSlotAlreadyBooked;

  const tooltipLabel = isDisable
    ? "You need to add at least 1 pet to join this activity."
    : !hasSelectedDate
      ? "Please select a date and time first."
      : isFull
        ? "This slot is fully booked."
        : isSlotAlreadyBooked
          ? "You already have a booking for this date."
          : effectiveIsPending
            ? "Your request is waiting for approval."
            : "";

  const buttonIcon = isFull
    ? "block"
    : isSlotAlreadyBooked
      ? "event_busy"
      : effectiveIsPending
        ? "hourglass_empty"
        : effectiveIsJoined
          ? "check_circle"
          : isLove
            ? "favorite"
            : "pets";

  const buttonLabel = isFull
    ? "Not Available"
    : isSlotAlreadyBooked
      ? "Already Booked"
      : effectiveIsPending
        ? "Waiting for Approve"
        : effectiveIsJoined
          ? isLove
            ? "Requested! 💕"
            : "Joined!"
          : isLove
            ? "Request a Date 💕"
            : "Request to Join";

  return (
    <>
      {!isPersonal && (
        <DateRangeCalendar
          isSingleDate={activity?.type === "grooming"}
          startDate={selectedStartDate}
          endDate={selectedEndDate}
          onStartChange={setSelectedStartDate}
          onEndChange={setSelectedEndDate}
          label="Pick a Date & Time"
          attendeesByDate={attendeesByDate}
          slots={activity?.slots}
          onSlotChange={setSelectedSlotId}
          minAdvanceDays={2}
        />
      )}
      <Tooltip
        className="w-full mt-4"
        label={tooltipLabel}
        isDisable={!buttonDisabled}
      >
        <button
          onClick={onAttendeeJoin}
          className={clsx(
            "w-full h-14 rounded-xl font-bold text-[16px] flex items-center justify-center gap-2 transition-all shadow-sm active:scale-[0.98]",
            {
              "bg-white border-2 border-rose-300 text-rose-500 hover:bg-rose-50":
                effectiveIsJoined && isLove,
              "bg-white border-2 border-[#e2cfb7] text-[#1e293b] hover:bg-[rgba(226,207,183,0.1)]":
                effectiveIsJoined && !isLove,
              "bg-amber-100 text-amber-700 border-2 border-amber-200":
                effectiveIsPending && !effectiveIsJoined,
              "bg-slate-100 text-slate-400 border-2 border-slate-200 cursor-not-allowed":
                isSlotAlreadyBooked,
              "bg-rose-500 text-white hover:bg-rose-600":
                !effectiveIsJoined &&
                !effectiveIsPending &&
                !isSlotAlreadyBooked &&
                isLove &&
                !isFull,
              "bg-[#e2cfb7] text-[#1e293b] hover:opacity-90":
                !effectiveIsJoined &&
                !effectiveIsPending &&
                !isSlotAlreadyBooked &&
                !isLove &&
                !isFull,
              "bg-slate-200 text-slate-400 cursor-not-allowed": isFull,
              "opacity-50 pointer-events-none": buttonDisabled,
            },
          )}
          disabled={buttonDisabled}
        >
          <span className="material-symbols-outlined">{buttonIcon}</span>
          {buttonLabel}
        </button>
      </Tooltip>
      {activity && (
        <RequestModal
          open={!!joinActivityId}
          pets={pets ?? []}
          activityType={activity.type}
          activitySizes={activity.sizes}
          onConfirm={(selectedId, message, needsApproval) => {
            if (!joinActivityId) return;
            const endFallback =
              selectedEndDate || `${selectedStartDate.split("T")[0]}T23:59`;
            createAttendee(
              {
                activityId: joinActivityId,
                attendeeId: selectedId,
                role: "pet",
                status: needsApproval ? "pending" : "joined",
                requestMessage: message,
                startDate: selectedStartDate
                  ? new Date(selectedStartDate)
                  : undefined,
                endDate: selectedStartDate ? new Date(endFallback) : undefined,
                ...(selectedSlotId ? { activitySlotID: selectedSlotId } : {}),
              },
              { onSuccess: () => setJoinActivityId(null) },
            );
          }}
          onCancel={() => setJoinActivityId(null)}
        />
      )}
    </>
  );
}

/* ── Host actions ── */
function HostActions({
  attendees,
  allAttendees,
  activityId,
  showRequests,
  setShowRequests,
  onEnded,
  onPaused,
  isLove,
  isBusiness = false,
}: {
  attendees: Attendee[];
  allAttendees: Attendee[];
  activityId: string;
  showRequests: boolean;
  setShowRequests: (v: boolean) => void;
  onEnded: () => void;
  onPaused: () => void;
  isLove?: boolean;
  isBusiness?: boolean;
}) {
  const router = useRouter();
  const { toast } = useToast();
  const { mutate: updateAttendee } = useUpdateAttendee();
  const [showCloseOptions, setShowCloseOptions] = useState(false);
  const [showPauseConfirm, setShowPauseConfirm] = useState(false);
  const [showEndConfirm, setShowEndConfirm] = useState(false);

  // Fill every day in the attendee's booked range
  const attendeesByDate: Record<string, { image: string; name: string }[]> = {};
  allAttendees.forEach((a) => {
    (a.dateRanges ?? []).forEach((range) => {
      if (!range.startDate) return;
      const start = dayjs(range.startDate).startOf("day");
      const end = range.endDate ? dayjs(range.endDate).startOf("day") : start;
      let current = start;
      while (!current.isAfter(end)) {
        const dateKey = current.format("YYYY-MM-DD");
        if (!attendeesByDate[dateKey]) attendeesByDate[dateKey] = [];
        attendeesByDate[dateKey].push({ image: a.image, name: a.name });
        current = current.add(1, "day");
      }
    });
  });

  return (
    <div className="flex flex-col gap-3">
      <DateRangeCalendar
        readOnly
        startDate=""
        endDate=""
        onEndChange={() => {}}
        onStartChange={() => {}}
        label="Attendance Calendar"
        attendeesByDate={attendeesByDate}
        onDayClick={(dateKey) =>
          router.push(`/activity/attendees/${activityId}?date=${dateKey}`)
        }
      />
      {!isBusiness && (
        <button
          onClick={() => router.push(`/activity/attendees/${activityId}`)}
          className={clsx(
            "w-full h-14 bg-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all active:scale-[0.98]",
            isLove
              ? "border-2 border-rose-300 text-rose-500 hover:bg-rose-50"
              : "border-2 border-[#e2cfb7] text-[#1e293b] hover:bg-[rgba(226,207,183,0.1)]",
          )}
        >
          <span className="material-symbols-outlined">person_add</span>
          Manage Requests ({attendees.length ?? 0})
        </button>
      )}

      {showRequests && (
        <div
          className={clsx(
            "rounded-xl divide-y overflow-hidden",
            isLove
              ? "bg-white border border-rose-100 divide-rose-50"
              : "bg-white border border-[#f1f5f9] divide-[#f1f5f9]",
          )}
        >
          {attendees.map(({ _id, name, requestMessage }) => (
            <div
              key={_id}
              className="flex items-center justify-between px-4 py-3 gap-3"
            >
              <div className="flex items-center gap-3">
                <div
                  className={clsx(
                    "w-10 h-10 rounded-full flex items-center justify-center text-lg",
                    isLove ? "bg-rose-100" : "bg-[rgba(226,207,183,0.4)]",
                  )}
                >
                  {isLove ? "🐶" : "🐶"}
                </div>
                <div>
                  <p className="text-[14px] font-bold text-[#1e293b]">{name}</p>
                  {requestMessage && (
                    <p className="text-[12px] text-[#64748b]">
                      &quot;{requestMessage}&quot;
                    </p>
                  )}
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() =>
                    updateAttendee(
                      { _id, status: "joined" },
                      {
                        onSuccess: () =>
                          toast(`${name} has been approved!`, "success"),
                        onError: () =>
                          toast("Failed to approve request.", "error"),
                      },
                    )
                  }
                  className={clsx(
                    "w-9 h-9 rounded-full flex items-center justify-center transition-colors",
                    isLove
                      ? "bg-rose-100 hover:bg-rose-200"
                      : "bg-[rgba(226,207,183,0.3)] hover:bg-[rgba(226,207,183,0.6)]",
                  )}
                >
                  <span
                    className="material-symbols-outlined text-[#1e293b]"
                    style={{ fontSize: 18 }}
                  >
                    check
                  </span>
                </button>
                <button
                  onClick={() =>
                    updateAttendee(
                      { _id, status: "rejected" },
                      {
                        onSuccess: () =>
                          toast(`${name} has been rejected.`, "info"),
                        onError: () =>
                          toast("Failed to reject request.", "error"),
                      },
                    )
                  }
                  className="w-9 h-9 rounded-full bg-[rgba(226,207,183,0.1)] border border-[#e2e8f0] flex items-center justify-center hover:bg-red-50 transition-colors"
                >
                  <span
                    className="material-symbols-outlined text-[#94a3b8]"
                    style={{ fontSize: 18 }}
                  >
                    close
                  </span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="flex flex-col gap-2">
        <button
          className="flex-1 h-14 bg-white border-2 border-[#e2cfb7] text-[#1e293b] font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-[rgba(226,207,183,0.15)] transition-all active:scale-[0.98] py-2"
          onClick={() => router.push(`/activity/edit/${activityId}`)}
        >
          <span className="material-symbols-outlined">edit</span>
          Edit
        </button>
        <button
          className={clsx(
            "flex-1 h-14 text-white font-bold rounded-xl flex items-center justify-center gap-2 hover:opacity-90 transition-all shadow-sm active:scale-[0.98] py-3",
            isLove ? "bg-rose-500" : "bg-[#1e293b]",
          )}
          onClick={() => setShowCloseOptions(true)}
        >
          <span className="material-symbols-outlined">
            {isLove ? "heart_broken" : "pets"}
          </span>
          {isLove ? "End Match" : "End Activity"}
        </button>
      </div>

      {/* Close options sheet */}
      {showCloseOptions &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            className="fixed inset-0 z-[9998] flex items-end justify-center bg-black/40 backdrop-blur-sm px-4 pb-6 animate-in fade-in duration-150"
            onClick={() => setShowCloseOptions(false)}
          >
            <div
              className="w-full max-w-sm bg-white rounded-3xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-200"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="h-1 w-full bg-[#e2cfb7]" />
              <div className="p-6 flex flex-col gap-4">
                <h3 className="text-[17px] font-bold text-[#1e293b] text-center">
                  {isLove ? "Close Match" : "Close Activity"}
                </h3>
                <button
                  className="w-full flex items-center gap-4 p-4 rounded-2xl border border-[rgba(226,207,183,0.6)] hover:bg-[#faf8f5] active:scale-[0.98] transition-all text-left"
                  onClick={() => {
                    setShowCloseOptions(false);
                    setShowPauseConfirm(true);
                  }}
                >
                  <div className="w-10 h-10 rounded-full bg-[rgba(226,207,183,0.3)] flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-[20px] text-[#64748b]">
                      pause_circle
                    </span>
                  </div>
                  <div>
                    <p className="text-[14px] font-bold text-[#1e293b]">
                      Pause temporarily
                    </p>
                    <p className="text-[12px] text-[#64748b] mt-0.5">
                      Hide from discovery — you can reactivate later.
                    </p>
                  </div>
                </button>
                <button
                  className="w-full flex items-center gap-4 p-4 rounded-2xl border border-red-100 hover:bg-red-50 active:scale-[0.98] transition-all text-left"
                  onClick={() => {
                    setShowCloseOptions(false);
                    setShowEndConfirm(true);
                  }}
                >
                  <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-[20px] text-red-400">
                      {isLove ? "heart_broken" : "cancel"}
                    </span>
                  </div>
                  <div>
                    <p className="text-[14px] font-bold text-red-500">
                      End permanently
                    </p>
                    <p className="text-[12px] text-[#64748b] mt-0.5">
                      This cannot be undone.
                    </p>
                  </div>
                </button>
                <button
                  className="w-full py-3 rounded-xl border border-[#e2e8f0] text-[13px] font-bold text-[#64748b] hover:bg-[#f8fafc] active:scale-95 transition-all"
                  onClick={() => setShowCloseOptions(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>,
          document.body,
        )}

      {/* Pause confirm */}
      <ConfirmModal
        open={showPauseConfirm}
        title="Pause activity?"
        description="Your activity will be hidden from discovery. You can reactivate it anytime."
        confirmLabel="Pause"
        confirmClassName="bg-[#1e293b] text-white hover:bg-[#0f172a]"
        icon={
          <span className="material-symbols-outlined text-2xl text-[#64748b]">
            pause_circle
          </span>
        }
        onConfirm={() => {
          setShowPauseConfirm(false);
          onPaused();
        }}
        onCancel={() => setShowPauseConfirm(false)}
      />

      {/* End permanently confirm */}
      <ConfirmModal
        open={showEndConfirm}
        title={isLove ? "End Match?" : "End Activity?"}
        description={
          isLove
            ? "Are you sure you want to end this match? This action cannot be undone."
            : "Are you sure you want to end this activity? This action cannot be undone."
        }
        confirmLabel={isLove ? "End Match" : "End Activity"}
        confirmClassName={
          isLove
            ? "bg-rose-500 text-white hover:bg-rose-600"
            : "bg-red-500 text-white hover:bg-red-600"
        }
        icon={
          <span className="material-symbols-outlined text-2xl text-red-400">
            {isLove ? "heart_broken" : "cancel"}
          </span>
        }
        onConfirm={() => {
          setShowEndConfirm(false);
          onEnded();
        }}
        onCancel={() => setShowEndConfirm(false)}
      />
    </div>
  );
}
