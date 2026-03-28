"use client";

import Image from "next/image";

const AVATAR_SLOT_STYLES = [
  { size: "w-24 h-24", zIndex: "z-30", marginLeft: "" },
  { size: "w-20 h-20", zIndex: "z-20", marginLeft: "-ml-6" },
  { size: "w-20 h-20", zIndex: "z-10", marginLeft: "-ml-6" },
  { size: "w-16 h-16", zIndex: "z-0", marginLeft: "-ml-5" },
] as const;

export default function AvatarGroup({
  members,
  selectedIndex,
  onSelect,
  onCreate,
  showNameTitles = false,
}: {
  members: { id: string; image?: string; name?: string; breed?: string }[];
  selectedIndex: number;
  onSelect: (i: number, id: string) => void;
  onCreate?: () => void;
  showNameTitles?: boolean;
}) {
  return (
    <div className="relative w-full h-full flex items-end justify-center mb-5">
      {members.map((m, i) => {
        const slot = AVATAR_SLOT_STYLES[i];
        return (
          <button
            key={`${m.name}-${i}`}
            onClick={() => onSelect(i, m.id)}
            title={showNameTitles ? `${m.name} · ${m.breed}` : undefined}
            className={`relative rounded-full border-4 overflow-hidden shadow-lg transition-all duration-300 cursor-pointer shrink-0
              ${slot.size} ${slot.zIndex} ${slot.marginLeft}
              ${
                selectedIndex === i
                  ? "border-[#e2cfb7] scale-110 -translate-y-3 z-50!"
                  : "border-[#f7f7f6] scale-95 opacity-75 hover:opacity-90 hover:scale-100"
              }
            `}
          >
            {m.image && (
              <Image
                src={m.image}
                alt={m.name ?? "Avatar"}
                width={256}
                height={256}
                className="w-full h-full object-cover"
              />
            )}
          </button>
        );
      })}
    </div>
  );
}
