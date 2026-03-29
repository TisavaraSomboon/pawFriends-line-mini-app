"use client";

import { Pet, User } from "@/lib/queries";

export default function MemberIdentity({
  member,
  compact = false,
  enableAddPet = false,
  onCreate,
  onEdit,
}: {
  member: User | Omit<Pet, "_id" | "userId">;
  compact?: boolean;
  enableAddPet?: boolean;
  onCreate?: () => void;
  onEdit?: () => void;
}) {
  return (
    <div className="relative flex flex-col text-center w-full transition-all duration-200">
      <h2
        className={`font-bold text-[#1e293b] ${compact ? "text-xl" : "text-2xl"}`}
      >
        {member.name}
      </h2>
      <div className="flex items-center justify-center gap-1 text-[#64748b] mt-1">
        <span className="material-symbols-outlined" style={{ fontSize: 14 }}>
          location_on
        </span>
        <span
          className={`font-medium text-ellipsis whitespace-nowrap overflow-hidden ${compact ? "text-xs" : "text-sm"}`}
        >
          {member.locationName}
        </span>
      </div>
      <p
        className={`mt-3 text-[#475569] leading-relaxed ${compact ? "text-[13px]" : "text-sm max-w-xs mx-auto"}`}
      >
        {member.bio}
      </p>
      <div className="w-full flex gap-4 justify-center">
        {onEdit && (
          <button
            className="mt-4 bg-[rgba(226,207,183,0.2)] border w-full border-[#e2cfb7] text-[#1e293b] max-w-90 font-bold py-3 px-6 rounded-xl flex items-center justify-center gap-2 shadow-sm active:scale-95 transition-transform hover:bg-[rgba(226,207,183,0.35)]"
            onClick={onEdit}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 20 }}>
              edit
            </span>
            Edit Profile
          </button>
        )}
        {enableAddPet && (
          <button
            className="mt-4 bg-[rgba(226,207,183,0.2)] border w-full border-[#e2cfb7] text-[#1e293b] max-w-90 font-bold py-3 px-6 rounded-xl flex items-center justify-center gap-2 shadow-sm active:scale-95 transition-transform hover:bg-[rgba(226,207,183,0.35)]"
            onClick={onCreate}
          >
            <span
              className="material-symbols-outlined"
              style={{ fontSize: 20 }}
            >
              add
            </span>
            <span>Add pet</span>
          </button>
        )}
      </div>
    </div>
  );
}
