"use client";

import { useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Pet, PetAgeGroup, Tier, User, useProfile } from "@/lib/queries";
import SettingsMenu from "@/components/SettingsMenu";
import {
  AvatarGroup,
  MemberIdentity,
  StatsGrid,
  DogProfileDetail,
} from "@/components/profile";
import { useToast } from "@/components/Toast";
import { MAX_PACK_SIZE } from "@/lib/constants";
import NotFoundPage from "@/components/NotFoundPage";

/* ── Page ── */
export default function ProfilePage() {
  const { toast } = useToast();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const settingsBtnRef = useRef<HTMLButtonElement>(null);
  const router = useRouter();

  const { data, isLoading } = useProfile();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  console.log("Profile data:", data);

  const members = useMemo(() => {
    if (!data) return [];
    return [data.user, ...(data.pets ?? [])] as (User | Pet)[];
  }, [data]);

  const selectedIndex = useMemo(() => {
    if (!selectedId || members.length === 0) return 0;
    const idx = members.findIndex((m) => m._id === selectedId);
    return idx >= 0 ? idx : 0;
  }, [selectedId, members]);

  const member = members[selectedIndex] as Pet | undefined;
  const user = selectedIndex === 0 ? (members[0] as User) : undefined;
  const isOwner = !!member && "tier" in member;

  const stats = member
    ? [
        { value: user?.followers ?? member.followers, label: "Followers" },
        { value: user?.following ?? member.following, label: "Following" },
        {
          value: `${(user?.rating ?? member.rating)?.toFixed(1)} ★`,
          label: "Rate",
        },
        {
          value: isOwner
            ? (member as User).tier
            : ((member as Pet).ageGroup ?? "—"),
          label: isOwner ? "Tier" : "Age Group",
        },
      ]
    : [];

  const handleCreateProfile = () => router.push("/profile/create");

  const handleEditProfile = () => {
    router.push(
      `/profile/edit/${!isOwner && selectedId ? selectedId : "owner"}`,
    );
  };

  const handleSelectProfile = (_i: number, id: string) => {
    setSelectedId(id);
  };

  const handleMarkHealth = (body: {
    sterilizing?: boolean;
    vaccine?: boolean;
    fleaTick?: boolean;
    microchipVerified?: boolean;
  }) => {
    if (!member) return;
    const fields = Object.keys(body).join(", ");
    toast(`${member.name}'s ${fields} has been updated.`, "success");
  };

  return (
    <div className="flex flex-col flex-1 min-w-0 min-h-dvh bg-[#f7f7f6]">
      {/* Header */}
      <header className="fixed top-0 z-10 bg-[#f7f7f6]/80 backdrop-blur-md flex items-center justify-between px-4 py-4 border-b border-[rgba(226,207,183,0.2)] w-full">
        <h1 className="text-[18px] font-bold tracking-tight text-[#1e293b]">
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

      {/* Content */}
      <div className="flex-1 overflow-y-auto pb-24 z-0 mt-20">
        {isLoading && (
          <div className="flex items-center justify-center h-64">
            <span className="material-symbols-outlined animate-spin text-[#c9a96e] text-4xl">
              progress_activity
            </span>
          </div>
        )}
        {!member && (
          <NotFoundPage
            title="Profile not found"
            description="This profile doesn't exist or has been removed."
          />
        )}
        {member && (
          <div className="max-w-lg mx-auto">
            <div className="flex flex-col items-center px-4 py-6">
              <AvatarGroup
                members={members.map((m) => ({
                  id: m._id,
                  image: m.image,
                  name: m.name ?? "",
                  breed: "breed" in m ? (m as Pet).breed : undefined,
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

            {selectedIndex !== 0 && (
              <div className="bg-slate-50 rounded-t-3xl px-6 min-h-48">
                <DogProfileDetail
                  name={member.name ?? ""}
                  vaccine={(member as Pet).vaccine}
                  fleaTick={(member as Pet).fleaTick}
                  breed={(member as Pet).breed}
                  ageGroup={(member as Pet).ageGroup}
                  energyLevel={(member as Pet).energyLevel}
                  emotions={(member as Pet).emotions}
                  socialStyle={(member as Pet).socialStyle}
                  behaviorTraits={(member as Pet).behaviorTraits}
                  goodWith={(member as Pet).goodWith}
                  considerNote={(member as Pet).considerNotes}
                  sterilizing={(member as Pet).sterilizing}
                  microchipVerified={(member as Pet).microchipVerified}
                  onMarkHealth={handleMarkHealth}
                />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
