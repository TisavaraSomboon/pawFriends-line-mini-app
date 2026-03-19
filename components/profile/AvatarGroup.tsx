"use client";

import Image from "next/image";
import Tooltip from "@/components/Tooltip";

const AVATAR_SLOT_STYLES = [
  { size: "w-24 h-24", zIndex: "z-30", marginLeft: "" },
  { size: "w-20 h-20", zIndex: "z-20", marginLeft: "-ml-6" },
  { size: "w-20 h-20", zIndex: "z-10", marginLeft: "-ml-6" },
  { size: "w-16 h-16", zIndex: "z-0", marginLeft: "-ml-5" },
] as const;

const MAX_PACK_SIZE = 4;

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
  onCreate: () => void;
  showNameTitles?: boolean;
}) {
  return (
    <div className="flex items-end justify-center mb-5">
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
      {members.length < MAX_PACK_SIZE && (
        <Tooltip label="Add new pets" position="bottom">
          <button
            className="relative rounded-full border-4 border-dashed border-[#cbd5e1] bg-[#f7f7f6] w-12 h-12 -ml-4 z-0 flex items-center justify-center shrink-0 text-[#94a3b8] shadow-sm transition-all duration-300 scale-95 opacity-75 hover:opacity-90 hover:scale-100 hover:border-[#e2cfb7]"
            onClick={onCreate}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 20 }}>
              add
            </span>
          </button>
        </Tooltip>
      )}
    </div>
  );
}
