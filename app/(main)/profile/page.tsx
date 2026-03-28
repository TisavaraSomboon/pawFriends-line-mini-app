"use client";

import { useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Pet,
  PetAgeGroup,
  Tier,
  useActivities,
  useProfile,
  User,
  useUpdatePetProfile,
} from "@/lib/queries";
import SettingsMenu from "@/components/SettingsMenu";
import {
  AvatarGroup,
  MemberIdentity,
  StatsGrid,
  DogProfileDetail,
  ActivitiesSection,
} from "@/components/profile";
import { useToast } from "@/components/Toast";
import SpinLoader from "@/components/SpinLoader";
import NotFoundPage from "@/components/NotFoundPage";
import { MAX_PACK_SIZE } from "@/lib/constants";

/* ─────────────────────────────────────────────────────── page ── */

export default function ProfilePage() {
  const { toast } = useToast();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const settingsBtnRef = useRef<HTMLButtonElement>(null);

  const router = useRouter();
  const searchParams = useSearchParams();
  const params = new URLSearchParams(searchParams.toString());
  const profileId = params.get("Id");

  const { data: allProfiles, isPending: isUserPending } = useProfile();
  const { mutate: updatePet, isPending: isUpdatePetPending } =
    useUpdatePetProfile(profileId ?? "");
  const { data: userActivities, isFetching: isActivitiesFetching } =
    useActivities(allProfiles?.user._id);

  const selectedIndex = useMemo(() => {
    if (!allProfiles || !profileId) return 0;
    const idx = [allProfiles.user, ...(allProfiles.pets ?? [])].findIndex(
      (m) => m._id === profileId,
    );
    return idx >= 0 ? idx : 0;
  }, [profileId, allProfiles]);

  if (isUserPending || isUpdatePetPending || isActivitiesFetching)
    return <SpinLoader title="Loading Profile" />;

  if (!allProfiles)
    return (
      <div className="flex flex-col w-full">
        <header className="sticky top-0 z-10 bg-[#f7f7f6]/80 backdrop-blur-md flex items-center justify-between px-4 md:px-8 py-4 border-b border-[rgba(226,207,183,0.2)]">
          <h1 className="text-[18px] md:text-xl font-bold tracking-tight text-[#1e293b]">
            My Pack Profile
          </h1>
          <div className="relative">
            <button
              ref={settingsBtnRef}
              onClick={() => setSettingsOpen((v) => !v)}
              className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-[rgba(226,207,183,0.2)] transition-colors"
            >
              <span className="material-symbols-outlined text-[#1e293b]">
                settings
              </span>
            </button>
            <SettingsMenu
              open={settingsOpen}
              onClose={() => setSettingsOpen(false)}
              anchorRef={settingsBtnRef}
            />
          </div>
        </header>
        <NotFoundPage
          title="Profile not found"
          description="We couldn't find your profile. It may have been removed or
          hasn't been set up yet."
        />
      </div>
    );

  const members = [allProfiles.user, ...(allProfiles.pets ?? [])];
  const user = selectedIndex === 0 ? (members[0] as User) : undefined;
  const member: Pet = members[selectedIndex] as Pet;
  const isOwner = typeof member === "object" && "tier" in member;
  const stats = [
    { value: user?.followers ?? member.followers, label: "Followers" },
    { value: user?.following ?? member.following, label: "Following" },
    {
      value: `${user?.rating?.toFixed(1) ?? member.rating?.toFixed(1)} ★`,
      label: "Rate",
    },
    {
      value: isOwner ? (member.tier as Tier) : (member.ageGroup as PetAgeGroup),
      label: isOwner ? "Tier" : "Age Group",
    },
  ];

  const handleCreateProfile = () => {
    router.push("/profile/create");
  };

  const handleEditProfile = () => {
    router.push(
      `/profile/edit/${!isOwner && profileId ? `${profileId}` : "owner"}`,
    );
  };

  const handleSelectProfile = (_i: number, id: string) => {
    params.set("Id", id);
    router.replace(`?${params.toString()}`);
  };

  const handleMarkHealth = (body: {
    sterilizing?: boolean;
    vaccine?: boolean;
    fleaTick?: boolean;
    microchipVerified?: boolean;
  }) => {
    const fields = Object.keys(body).join(", ");
    updatePet(body, {
      onSuccess: () => {
        toast(`${member.name}'s ${fields} has been updated.`, "success");
      },
      onError: () => {
        toast("Failed to update health status.", "error");
      },
    });
  };

  return (
    <div className="flex flex-col flex-1 min-w-0 min-h-dvh bg-[#f7f7f6]">
      {/* ── Header ── */}
      <header className="sticky top-0 z-10 bg-[#f7f7f6]/80 backdrop-blur-md flex items-center justify-between px-4 md:px-8 py-4 border-b border-[rgba(226,207,183,0.2)]">
        <h1 className="text-[18px] md:text-xl font-bold tracking-tight text-[#1e293b]">
          My Pack Profile
        </h1>
        <div className="relative">
          <button
            ref={settingsBtnRef}
            onClick={() => setSettingsOpen((v) => !v)}
            className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-[rgba(226,207,183,0.2)] transition-colors"
          >
            <span className="material-symbols-outlined text-[#1e293b]">
              settings
            </span>
          </button>
          <SettingsMenu
            open={settingsOpen}
            onClose={() => setSettingsOpen(false)}
            anchorRef={settingsBtnRef}
          />
        </div>
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
            onSelect={handleSelectProfile}
          />
          <MemberIdentity
            member={member}
            enableAddPet={isOwner && members.length < MAX_PACK_SIZE}
            onEdit={handleEditProfile}
            onCreate={handleCreateProfile}
          />
          <StatsGrid stats={stats} />
        </div>

        <div className="bg-slate-50 rounded-t-3xl px-6 min-h-48">
          {selectedIndex !== 0 ? (
            <DogProfileDetail
              name={member.name ?? ""}
              vaccine={member.vaccine}
              fleaTick={member.fleaTick}
              breed={member.breed}
              ageGroup={member.ageGroup}
              energyLevel={member.energyLevel}
              emotions={member.emotions}
              socialStyle={member.socialStyle}
              behaviorTraits={member.behaviorTraits}
              goodWith={member.goodWith}
              considerNote={member.considerNotes}
              sterilizing={member.sterilizing}
              microchipVerified={member.microchipVerified}
              onMarkHealth={handleMarkHealth}
            />
          ) : (
            <ActivitiesSection activity={userActivities} />
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
              onSelect={handleSelectProfile}
              showNameTitles
            />

            {/* Name chips */}
            <div className="flex gap-1.5 flex-wrap justify-center mb-5">
              {members.map((m, i) => (
                <button
                  key={`${m.name}`}
                  onClick={() => handleSelectProfile(i, m._id)}
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

            <MemberIdentity
              member={member}
              enableAddPet={isOwner && members.length < MAX_PACK_SIZE}
              compact
              onEdit={handleEditProfile}
              onCreate={handleCreateProfile}
            />
            <StatsGrid stats={stats} compact />
          </div>

          {/* Role badge */}
          <div className="px-6 pb-6 mt-auto">
            <div className="flex items-center gap-2 bg-white border border-[#f1f5f9] rounded-xl px-4 py-3">
              <span className="material-symbols-outlined text-[#e2cfb7]">
                shield_with_heart
              </span>
              <div>
                <p className="text-[11px] text-[#64748b] font-medium">Role</p>
                <p className="text-[13px] font-bold text-[#1e293b]">
                  {selectedIndex === 0 ? "Owner" : "Pet"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right panel */}
        <div className="flex-1 overflow-y-auto px-8 py-8">
          <div className="max-w-2xl">
            {selectedIndex !== 0 ? (
              <DogProfileDetail
                name={member.name ?? ""}
                vaccine={member.vaccine}
                fleaTick={member.fleaTick}
                breed={member.breed}
                ageGroup={member.ageGroup}
                energyLevel={member.energyLevel}
                emotions={member.emotions}
                socialStyle={member.socialStyle}
                behaviorTraits={member.behaviorTraits}
                goodWith={member.goodWith}
                considerNote={member.considerNotes}
                sterilizing={member.sterilizing}
                microchipVerified={member.microchipVerified}
                onMarkHealth={handleMarkHealth}
              />
            ) : (
              <ActivitiesSection activity={userActivities} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
