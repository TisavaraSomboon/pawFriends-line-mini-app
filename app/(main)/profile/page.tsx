"use client";

import { useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Pet, PetAgeGroup, Tier, User } from "@/lib/queries";
import SettingsMenu from "@/components/SettingsMenu";
import {
  AvatarGroup,
  MemberIdentity,
  StatsGrid,
  DogProfileDetail,
} from "@/components/profile";
import { useToast } from "@/components/Toast";
import { MAX_PACK_SIZE } from "@/lib/constants";

/* ── Mock data ── */
const MOCK_USER: User = {
  _id: "user-1",
  email: "tisavara@example.com",
  name: "Tisavara S.",
  image:
    "https://lh3.googleusercontent.com/aida-public/AB6AXuC4gSy4vsT1ox_x5hsjIqAmtZvDGD0M2bz-Uc-S4ZXfvNx36-WMJIw3A_wTsq5V3SCLMA0WH42p17-dMPIzXglkeUOsDRV-KMglvxdMqsn5otPKKYnZfGay0Fk_LhmBHFeJ4_NfpSYIs7vhmz6q1rhpFMxBbLcBPoX-yVbc24dWvSWvzrFNg1QiLhlGhPL_SzzADktBskiBTdfJEpQrIn9IMdb1Z_YpxruXx7w06DoBG4mT7U1Xj0bE8scY1OKxCaOPohC1dB1pm-8c",
  bio: "Dog lover & weekend adventurer 🐾 Always looking for new trails to explore with my pack.",
  locationName: "Bangkok, Thailand",
  followers: 128,
  following: 74,
  rating: 4.8,
  tier: Tier.Beginner,
};

const MOCK_PETS: Pet[] = [
  {
    _id: "pet-1",
    userId: "user-1",
    name: "Mochi",
    image:
      "https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=200&h=200&fit=crop",
    breed: "Shiba Inu",
    ageGroup: PetAgeGroup.Young,
    size: "MD",
    weight: 8,
    gender: "Male" as never,
    vaccine: true,
    fleaTick: true,
    sterilizing: false,
    microchipVerified: true,
    energyLevel: 2 as never,
    emotions: ["Happy", "Playful"],
    socialStyle: "Friendly",
    behaviorTraits: ["Curious", "Energetic"],
    goodWith: ["Dogs", "Kids"],
    followers: 56,
    following: 12,
    rating: 4.9,
  },
  {
    _id: "pet-2",
    userId: "user-1",
    name: "Luna",
    image:
      "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=200&h=200&fit=crop",
    breed: "Golden Retriever",
    ageGroup: PetAgeGroup.Adult,
    size: "LG",
    weight: 28,
    gender: "Female" as never,
    vaccine: true,
    fleaTick: false,
    sterilizing: true,
    microchipVerified: false,
    energyLevel: 1 as never,
    emotions: ["Calm", "Loving"],
    socialStyle: "Gentle",
    behaviorTraits: ["Loyal", "Patient"],
    goodWith: ["Everyone"],
    followers: 89,
    following: 23,
    rating: 5.0,
  },
];

/* ── Page ── */
export default function ProfilePage() {
  const { toast } = useToast();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const settingsBtnRef = useRef<HTMLButtonElement>(null);
  const router = useRouter();

  const allProfiles = { user: MOCK_USER, pets: MOCK_PETS };
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const members = [allProfiles.user, ...(allProfiles.pets ?? [])];

  const selectedIndex = useMemo(() => {
    if (!selectedId) return 0;
    const idx = members.findIndex((m) => m._id === selectedId);
    return idx >= 0 ? idx : 0;
  }, [selectedId, members]);

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
        <div className="max-w-lg mx-auto">
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

          {selectedIndex !== 0 && (
            <div className="bg-slate-50 rounded-t-3xl px-6 min-h-48">
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
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
