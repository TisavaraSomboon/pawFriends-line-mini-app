"use client";

import { useMemo, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import clsx from "clsx";
import {
  Pet,
  PetAgeGroup,
  PetEnergyLevel,
  Tier,
  useActivities,
  useProfile,
  User,
} from "@/lib/queries";
import { AvatarGroup, MemberIdentity, StatsGrid } from "@/components/profile";
import SpinLoader from "@/components/SpinLoader";
import NotFoundPage from "@/components/NotFoundPage";
import dayjs from "dayjs";
import calendar from "dayjs/plugin/calendar";

dayjs.extend(calendar);

/* ── Read-only pet detail ─────────────────────────────────────────────────── */
function PetDetailReadOnly({ pet }: { pet: Pet }) {
  const healthBadges = [
    {
      label: "Vaccine",
      value: pet.vaccine ? "Up to Date" : "Not yet",
      ok: !!pet.vaccine,
      icon: pet.vaccine ? "✓" : "!",
    },
    {
      label: "Flea & Tick",
      value: pet.fleaTick ? "Protected" : "At Risk",
      ok: !!pet.fleaTick,
      icon: pet.fleaTick ? "🛡" : "⚠",
    },
  ];

  return (
    <div className="flex flex-col gap-5">
      {/* Name + badges */}
      <div className="flex flex-col gap-4">
        <div className="flex justify-between items-start">
          <div className="flex flex-col gap-1.5">
            <h3 className="text-[18px] font-bold text-[#1e293b] tracking-tight">
              <span className="mr-2 rounded-full bg-[rgba(226,207,183,0.25)] border border-[rgba(226,207,183,0.5)] text-[12px] p-2">
                🐾
              </span>
              {pet.name}&apos;s Profile
            </h3>
          </div>
          <div className="flex flex-col gap-2">
            {pet.microchipVerified ? (
              <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-50 border border-blue-200 w-fit">
                <span
                  className="material-symbols-outlined text-blue-500"
                  style={{ fontSize: 13 }}
                >
                  verified
                </span>
                <span className="text-[11px] font-bold text-blue-600">
                  Bangkok Verified
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-red-50 border border-red-200 w-fit">
                <span
                  className="material-symbols-outlined text-red-500"
                  style={{ fontSize: 13 }}
                >
                  gpp_bad
                </span>
                <span className="text-[11px] font-bold text-red-600">
                  Not Verified
                </span>
              </div>
            )}
            <div
              className={clsx(
                "px-3 py-1.5 rounded-full border text-[12px] font-semibold flex items-center gap-1",
                pet.sterilizing
                  ? "border-green-200 bg-green-50 text-green-700"
                  : "bg-amber-50 border-amber-200 text-amber-700",
              )}
            >
              <span
                className="material-symbols-outlined"
                style={{ fontSize: 18 }}
              >
                {pet.sterilizing ? "heart_check" : "heart_plus"}
              </span>
              {pet.sterilizing ? "Sterilized" : "Not yet sterilized"}
            </div>
          </div>
        </div>
        <p className="text-[12px] font-medium text-[#64748b] mt-0.5">
          {pet.breed}
        </p>
      </div>

      {/* Health badges (read-only) */}
      <div className="flex gap-3">
        {healthBadges.map((badge) => (
          <div
            key={badge.label}
            className={clsx(
              "flex-1 flex items-center gap-3 rounded-xl px-4 py-3 border",
              badge.ok
                ? "bg-green-50 border-green-200"
                : "bg-amber-50 border-amber-200",
            )}
          >
            <span className="text-lg">{badge.icon}</span>
            <div>
              <p className="text-[10px] font-semibold text-[#64748b] uppercase tracking-wide">
                {badge.label}
              </p>
              <p
                className={`text-[13px] font-bold ${badge.ok ? "text-green-700" : "text-amber-700"}`}
              >
                {badge.value}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Energy level */}
      {pet.energyLevel !== undefined && (
        <div>
          <div className="flex justify-between items-center mb-2">
            <p className="text-[13px] font-semibold text-[#1e293b]">
              Energy Level
            </p>
            <p className="text-[12px] font-bold text-[#e2cfb7]">
              {pet.energyLevel}
            </p>
          </div>
          <div className="flex gap-2">
            {Array.from({ length: 4 }, (_, i) => i).map((dot) => (
              <div
                key={dot}
                className={clsx(
                  "flex-1 h-2 rounded-full",
                  pet.energyLevel &&
                    dot <=
                      Object.values(PetEnergyLevel).indexOf(pet.energyLevel)
                    ? "bg-[#e2cfb7]"
                    : "bg-[#e2e8f0]",
                )}
              />
            ))}
          </div>
        </div>
      )}

      {/* Emotional profile */}
      {!!pet.emotions?.length && (
        <div>
          <p className="text-[13px] font-semibold text-[#1e293b] mb-2">
            Emotional Profile
          </p>
          <div className="flex flex-wrap gap-2">
            {pet.emotions.map((e) => (
              <span
                key={e}
                className="px-3 py-1.5 rounded-full bg-[rgba(226,207,183,0.25)] border border-[rgba(226,207,183,0.5)] text-[12px] font-semibold text-[#334155]"
              >
                {e}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Social behavior */}
      {pet.socialStyle && (
        <div className="bg-white rounded-xl border border-[#f1f5f9] p-4">
          <p className="text-[13px] font-bold text-[#1e293b] mb-2">
            💬 Social Behavior
          </p>
          <p className="text-[13px] text-[#475569] leading-relaxed">
            {pet.socialStyle}
          </p>
        </div>
      )}

      {/* Key behaviors */}
      {!!pet.behaviorTraits?.length && (
        <div>
          <p className="text-[13px] font-semibold text-[#1e293b] mb-2">
            Key Behaviors
          </p>
          <div className="flex flex-col gap-2">
            {pet.behaviorTraits.map((t) => (
              <div key={t} className="flex items-center gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-[#e2cfb7] shrink-0" />
                <p className="text-[13px] font-medium text-[#334155]">{t}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Good with */}
      {!!pet.goodWith?.length && (
        <div>
          <p className="text-[13px] font-semibold text-[#1e293b] mb-2">
            Good With
          </p>
          <div className="flex flex-wrap gap-2">
            {pet.goodWith.map((g) => (
              <span
                key={g}
                className="px-3 py-1.5 rounded-full bg-green-50 border border-green-200 text-[12px] font-semibold text-green-700"
              >
                ✓ {g}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Before you meet */}
      {pet.considerNotes && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
          <p className="text-[13px] font-bold text-amber-800 mb-1">
            ⚠️ Before You Meet
          </p>
          <p className="text-[13px] text-amber-900 leading-relaxed">
            {pet.considerNotes}
          </p>
        </div>
      )}
    </div>
  );
}

/* ── Activities read-only ─────────────────────────────────────────────────── */
function ActivitiesReadOnly({ userId }: { userId: string }) {
  const { data: activities } = useActivities(userId);

  if (!activities?.length) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
        <span
          className="material-symbols-outlined text-[#e2cfb7]"
          style={{ fontSize: 40 }}
        >
          pets
        </span>
        <p className="text-[14px] font-bold text-[#1e293b]">
          No activities yet
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <h3 className="text-[17px] font-bold text-[#1e293b]">
        Activities ({activities.length})
      </h3>
      {activities.map((a) => (
        <div
          key={a._id}
          className="bg-white rounded-xl border border-[#f1f5f9] shadow-sm p-4 flex gap-4"
        >
          {a.image && (
            <Image
              src={a.image}
              alt={a.title}
              width={56}
              height={56}
              className="w-14 h-14 rounded-xl object-cover shrink-0"
            />
          )}
          <div className="flex-1 min-w-0">
            <p className="text-[14px] font-bold text-[#1e293b] truncate">
              {a.title}
            </p>
            <p className="text-[12px] text-[#64748b] mt-0.5">
              {dayjs(a.startDate).calendar()} · {a.locationName}
            </p>
            <div className="flex gap-1 mt-1 flex-wrap">
              {a.sizes.map((s) => (
                <span
                  key={s}
                  className="px-2 py-0.5 rounded-full bg-[rgba(226,207,183,0.3)] text-[10px] font-semibold text-[#64748b]"
                >
                  {s}
                </span>
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ── Public profile page ──────────────────────────────────────────────────── */
export default function PublicProfilePage() {
  const router = useRouter();
  const { id: userId } = useParams<{ id: string }>();

  const searchParams = useSearchParams();
  const preselectedId = searchParams.get("Id");

  const { data: allProfiles, isPending } = useProfile(userId);

  const members = useMemo(() => {
    if (!allProfiles) return [];
    return [allProfiles.user, ...(allProfiles.pets ?? [])];
  }, [allProfiles]);

  const [manualIndex, setManualIndex] = useState<number | null>(null);

  const selectedIndex = useMemo(() => {
    if (manualIndex !== null) return manualIndex;
    if (preselectedId && members.length) {
      const idx = members.findIndex((m) => m._id === preselectedId);
      return idx >= 0 ? idx : 0;
    }
    return 0;
  }, [manualIndex, preselectedId, members]);

  const member = members[selectedIndex] as Pet | User | undefined;
  const isOwnerTab = selectedIndex === 0;

  const stats = useMemo(() => {
    if (!member) return [];
    const isOwner = "tier" in member;
    return [
      { value: member.followers, label: "Followers" },
      { value: member.following, label: "Following" },
      { value: `${member.rating?.toFixed(1)} ★`, label: "Rate" },
      {
        value: isOwner
          ? ((member as User).tier as Tier)
          : ((member as Pet).ageGroup as PetAgeGroup),
        label: isOwner ? "Tier" : "Age Group",
      },
    ];
  }, [member]);

  if (isPending) return <SpinLoader title="Loading profile" />;

  if (!allProfiles || !member) {
    return (
      <NotFoundPage
        title="Profile not found"
        description="This profile doesn't exist or has been removed."
      />
    );
  }

  const owner = allProfiles.user;

  return (
    <div className="flex flex-col flex-1 min-w-0 min-h-dvh bg-[#f7f7f6]">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-[#f7f7f6]/80 backdrop-blur-md flex items-center justify-between px-4 md:px-8 py-4 border-b border-[rgba(226,207,183,0.2)]">
        <button
          onClick={() => router.back()}
          className="w-10 h-10 rounded-xl flex items-center justify-center hover:bg-[rgba(226,207,183,0.2)] transition-colors"
        >
          <span className="material-symbols-outlined text-[#1e293b]">
            arrow_back
          </span>
        </button>
        <h1 className="text-[17px] font-bold text-[#1e293b] tracking-tight flex-1 text-center">
          {owner.name}&apos;s Pack
        </h1>
        {/* Follow button — placeholder for future feature */}
        <button
          disabled
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#e2cfb7] text-[#1e293b] text-[13px] font-bold opacity-60 cursor-not-allowed"
        >
          <span className="material-symbols-outlined" style={{ fontSize: 16 }}>
            person_add
          </span>
          Follow
        </button>
      </header>

      {/* ── Mobile layout ── */}
      <div className="md:hidden flex-1 overflow-y-auto pb-24">
        <div className="flex flex-col items-center px-4 py-6">
          <AvatarGroup
            members={members.map((m) => ({
              id: m._id,
              image: m.image,
              name: m.name ?? "",
              breed: "breed" in m ? m.breed : undefined,
            }))}
            selectedIndex={selectedIndex}
            onSelect={(i) => setManualIndex(i)}
          />
          <MemberIdentity member={member} />
          <StatsGrid stats={stats} />
        </div>

        <div className="bg-slate-50 rounded-t-3xl p-6 min-h-48">
          {isOwnerTab ? (
            <ActivitiesReadOnly userId={userId} />
          ) : (
            <PetDetailReadOnly pet={member as Pet} />
          )}
        </div>
      </div>

      {/* ── Desktop layout ── */}
      <div className="hidden md:flex flex-1 gap-0 overflow-hidden">
        {/* Left panel */}
        <div className="flex-1 w-90 shrink-0 border-r border-[rgba(226,207,183,0.2)] overflow-y-auto flex flex-col bg-[#f7f7f6]">
          <div className="flex flex-col items-center px-6 pt-8 pb-4">
            <AvatarGroup
              members={members.map((m) => ({
                id: m._id,
                image: m.image,
                name: m.name ?? "",
                breed: "breed" in m ? m.breed : undefined,
              }))}
              selectedIndex={selectedIndex}
              onSelect={(i) => setManualIndex(i)}
              showNameTitles
            />

            {/* Name chips */}
            <div className="flex gap-1.5 flex-wrap justify-center mb-5">
              {members.map((m, i) => (
                <button
                  key={m._id}
                  onClick={() => setManualIndex(i)}
                  className={`px-3 py-1 rounded-full text-[11px] font-bold transition-all ${
                    selectedIndex === i
                      ? "bg-[#e2cfb7] text-[#1e293b]"
                      : "bg-white border border-[#f1f5f9] text-[#64748b] hover:border-[#e2cfb7]"
                  }`}
                >
                  {m.name}
                </button>
              ))}
            </div>

            <MemberIdentity member={member} compact />
            <StatsGrid stats={stats} compact />
          </div>

          {/* Follow button */}
          <div className="px-6 pb-6 mt-auto">
            <button
              disabled
              className="w-full flex items-center justify-center gap-2 bg-[#e2cfb7] text-[#1e293b] font-bold text-[14px] py-3 rounded-xl opacity-60 cursor-not-allowed"
            >
              <span
                className="material-symbols-outlined"
                style={{ fontSize: 18 }}
              >
                person_add
              </span>
              Follow {owner.name}
            </button>
          </div>
        </div>

        {/* Right panel */}
        <div className="flex-1 overflow-y-auto px-8 py-8">
          <div className="max-w-2xl">
            {isOwnerTab ? (
              <ActivitiesReadOnly userId={userId} />
            ) : (
              <PetDetailReadOnly pet={member as Pet} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
