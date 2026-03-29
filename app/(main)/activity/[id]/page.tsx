"use client";

import { useEffect, useState } from "react";
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
  useProfile,
  useUpdateAttendee,
} from "@/lib/queries";
import SpinLoader from "@/components/SpinLoader";
import RequestModal from "@/components/RequestModal";
import { useToast } from "@/components/Toast";
import clsx from "clsx";
import Tooltip from "@/components/Tooltip";
import ConfirmModal from "@/components/ConfirmModal";

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
      activity?.attendees?.some((a) => a.name === pet.name),
    );

  if (isFetching) return <SpinLoader title="Loading activity" />;

  const actionPanel = isHost ? (
    <HostActions
      attendees={requestAttendees}
      showRequests={showRequests}
      setShowRequests={setShowRequests}
      onEnded={() => endedActivity()}
      isLove={isLove}
    />
  ) : (
    <UserAction
      joinActivityId={joinActivityId}
      setJoinActivityId={setJoinActivityId}
      activity={activity}
      pets={allProfiles?.pets ?? []}
      isJoined={isAllPetJoined}
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
            "fixed bottom-20 left-1/2 -translate-x-1/2 w-full max-w-107.5 p-4 backdrop-blur-md border-t",
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
          {/* Hero image */}
          <div
            className={clsx(
              "w-full h-80 rounded-2xl bg-center bg-cover bg-no-repeat mb-6 relative overflow-hidden",
              isLove && "ring-2 ring-rose-200",
            )}
            style={{ backgroundImage: `url("${activity?.image ?? ""}")` }}
          >
            {isLove && (
              <div className="absolute inset-0 bg-gradient-to-t from-rose-900/30 to-transparent" />
            )}
          </div>

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
            <p className="text-[15px] text-[#475569] leading-relaxed">
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
                <div className="flex -space-x-2">
                  {activity?.attendees?.slice(0, 3).map(({ image, name }) => (
                    <div
                      key={name}
                      className={clsx(
                        "w-8 h-8 rounded-full border-2 overflow-hidden",
                        isLove ? "border-rose-200" : "border-white",
                      )}
                    >
                      <Image
                        src={image}
                        alt={name}
                        className="w-full h-full object-cover"
                        width={64}
                        height={64}
                      />
                    </div>
                  ))}
                </div>
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

/* ── Shared attendee grid ── */
function AttendeeGrid({
  attendees,
  isLove,
}: {
  attendees: Attendee[];
  isLove?: boolean;
}) {
  const router = useRouter();
  return (
    <div className="flex flex-wrap gap-4">
      {attendees.map(({ image, name, ownerId, attendeeId }) => (
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
          <p className="text-xs font-medium text-[#475569] text-center truncate w-full">
            {name}
          </p>
        </button>
      ))}
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
      {/* Hero image */}
      {activity?.image && (
        <div
          className="relative w-full min-h-72 bg-center bg-cover bg-no-repeat"
          style={{ backgroundImage: `url("${activity.image}")` }}
        >
          {isLove && (
            <div className="absolute inset-0 bg-gradient-to-t from-rose-900/30 to-transparent" />
          )}
        </div>
      )}

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
        <p className="text-[15px] text-[#475569] leading-relaxed">
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
  isLove,
  isDisable,
  setJoinActivityId,
  onAttendeeJoin,
}: {
  joinActivityId: string | null;
  activity?: Activity;
  pets: Pet[];
  isJoined: boolean;
  isLove?: boolean;
  isDisable?: boolean;
  setJoinActivityId: (open: string | null) => void;
  onAttendeeJoin: () => void;
}) {
  const { mutate: createAttendee } = useCreateAttendees();

  return (
    <>
      <Tooltip
        className="w-full"
        label="You need to add at least 1 pet to join this activity."
        isDisable={!isDisable}
      >
        <button
          onClick={onAttendeeJoin}
          className={clsx(
            "w-full h-14 rounded-xl font-bold text-[16px] flex items-center justify-center gap-2 transition-all shadow-sm active:scale-[0.98]",
            {
              "bg-white border-2 border-rose-300 text-rose-500 hover:bg-rose-50":
                isJoined && isLove,
              "bg-white border-2 border-[#e2cfb7] text-[#1e293b] hover:bg-[rgba(226,207,183,0.1)]":
                isJoined && !isLove,
              "bg-rose-500 text-white hover:bg-rose-600": !isJoined && isLove,
              "bg-[#e2cfb7] text-[#1e293b] hover:opacity-90":
                !isJoined && !isLove,
              "opacity-50 pointer-events-none": isDisable,
            },
          )}
          disabled={isDisable}
        >
          <span className="material-symbols-outlined">
            {isJoined ? "check_circle" : isLove ? "favorite" : "pets"}
          </span>
          {isJoined
            ? isLove
              ? "Requested! 💕"
              : "Joined!"
            : isLove
              ? "Request a Date 💕"
              : "Request to Join"}
        </button>
      </Tooltip>
      {activity && (
        <RequestModal
          open={!!joinActivityId}
          pets={pets ?? []}
          activityType={activity.type}
          activitySizes={activity.sizes}
          onConfirm={(selectedId, message) => {
            if (!joinActivityId) return;
            const pet = pets.find((p) => p._id === selectedId);
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
      )}
    </>
  );
}

/* ── Host actions ── */
function HostActions({
  attendees,
  showRequests,
  setShowRequests,
  onEnded,
  isLove,
}: {
  attendees: Attendee[];
  showRequests: boolean;
  setShowRequests: (v: boolean) => void;
  onEnded: () => void;
  isLove?: boolean;
}) {
  const { toast } = useToast();
  const { mutate: updateAttendee } = useUpdateAttendee();
  const [showEndConfirm, setShowEndConfirm] = useState(false);

  return (
    <div className="flex flex-col gap-3">
      <button
        onClick={() => setShowRequests(!showRequests)}
        className={clsx(
          "w-full h-14 bg-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all active:scale-[0.98]",
          isLove
            ? "border-2 border-rose-300 text-rose-500 hover:bg-rose-50"
            : "border-2 border-[#e2cfb7] text-[#1e293b] hover:bg-[rgba(226,207,183,0.1)]",
        )}
      >
        <span className="material-symbols-outlined">person_add</span>
        {showRequests
          ? "Hide Requests"
          : `Manage Requests (${attendees.length ?? 0})`}
      </button>

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

      <button
        className={clsx(
          "w-full h-14 text-white font-bold rounded-xl flex items-center justify-center gap-2 hover:opacity-90 transition-all shadow-sm active:scale-[0.98]",
          isLove ? "bg-rose-500" : "bg-[#1e293b]",
        )}
        onClick={() => setShowEndConfirm(true)}
      >
        <span className="material-symbols-outlined">
          {isLove ? "heart_broken" : "pets"}
        </span>
        {isLove ? "End Match" : "End Activity"}
      </button>

      <ConfirmModal
        open={showEndConfirm}
        title={isLove ? "End Match?" : "End Activity?"}
        description={
          isLove
            ? "Are you sure you want to end this match? This action cannot be undone."
            : "Are you sure you want to end this activity? This action cannot be undone."
        }
        confirmLabel={isLove ? "End Match" : "End Activity"}
        confirmClassName={isLove ? "bg-rose-500 text-white hover:bg-rose-600" : "bg-[#1e293b] text-white hover:bg-[#0f172a]"}
        icon={
          <span className="material-symbols-outlined text-2xl text-[#64748b]">
            {isLove ? "heart_broken" : "pets"}
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
