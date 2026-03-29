"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import clsx from "clsx";
import type { Pet } from "@/lib/queries";
import { useCompatibility } from "@/lib/queries";
import SpinLoader from "./SpinLoader";

type Props = {
  open: boolean;
  pets: Pet[];
  activityTitle?: string;
  activityType?: string;
  activitySizes?: string[];
  onCancel: () => void;
  onConfirm: (selectedId: string, message?: string) => void;
};

function getCompatibility(pet?: Pet): number {
  if (!pet) return 0;
  const factors = [!!pet.breed, !!pet.vaccine, !!pet.fleaTick];
  const score = factors.filter(Boolean).length;
  return Math.round(5 + (score / factors.length) * 93);
}

function getCompatibilityColor(pct: number): string {
  if (pct >= 80) return "#4ade80"; // green
  if (pct >= 50) return "#e1cfb7"; // warm/neutral
  return "#f97316"; // orange warning
}

function getHealthBadge(pet: Pet): {
  label: string;
  icon: string;
  colorClass: string;
} {
  if (pet.vaccine && pet.fleaTick) {
    return {
      label: "Health Cleared",
      icon: "check_circle",
      colorClass: "text-emerald-600",
    };
  }
  // PetEnergyLevel.Low = 0, Medium = 1
  const isLowEnergy =
    pet.energyLevel !== undefined &&
    (pet.energyLevel as unknown as number) <= 1;
  if (isLowEnergy) {
    return {
      label: "Low Stamina Alert",
      icon: "info",
      colorClass: "text-amber-600",
    };
  }
  return {
    label: "Perfect Match",
    icon: "check_circle",
    colorClass: "text-emerald-600",
  };
}

export default function RequestModal({
  open,
  pets,
  activityTitle,
  activityType,
  activitySizes,
  onCancel,
  onConfirm,
}: Props) {
  const isLove = activityType === "love";
  const eligiblePets = isLove ? pets.filter((p) => !p.sterilizing) : pets;

  const [selectedId, setSelectedId] = useState<string>(eligiblePets[0]?._id ?? "");
  const [message, setMessage] = useState("");

  const selectedPet = eligiblePets.find((p) => p._id === selectedId);

  const { data: compatibility, isPending: isCompatibilityLoading } =
    useCompatibility(
      open && selectedPet && activityType
        ? {
            breed: selectedPet.breed,
            size: selectedPet.size,
            vaccine: selectedPet.vaccine,
            fleaTick: selectedPet.fleaTick,
            activityType,
            activitySizes,
          }
        : null,
    );
  const pct = compatibility?.score ?? getCompatibility(selectedPet);
  const color = isLove ? "#f43f5e" : getCompatibilityColor(pct);

  if (!open || typeof document === "undefined") return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[9998] flex justify-center bg-black/40 backdrop-blur-sm animate-in fade-in duration-150 items-center"
      onClick={onCancel}
    >
      <div
        className={clsx(
          "w-full max-w-md rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom duration-300",
          isLove ? "bg-rose-50" : "bg-[#f7f7f6]",
        )}
        style={{ maxHeight: "90dvh" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── Header ── */}
        <header className={clsx(
          "flex items-center px-4 pt-4 pb-2 justify-between shrink-0",
          isLove ? "bg-rose-50" : "bg-[#f7f7f6]",
        )}>
          <h2 className={clsx(
            "text-lg font-bold leading-tight tracking-tight flex-1 text-center",
            isLove ? "text-rose-600" : "text-[#1e293b]",
          )}>
            {isLove ? "💕 Find a Match" : "Join Activity"}
          </h2>
        </header>

        {/* ── Scrollable body ── */}
        <div className="flex-1 overflow-y-auto">
          {/* Section title */}
          <div className="px-4 pt-2 pb-4">
            <h3 className={clsx("text-xl font-bold tracking-tight", isLove ? "text-rose-700" : "text-[#1e293b]")}>
              {isLove ? "Which dog is looking for love?" : "Which dog is joining?"}
            </h3>
            <p className="text-[#64748b] text-sm mt-1">
              {isLove
                ? "Select the dog you'd like to find a match for."
                : "Select the furry friend who'll participate today."}
            </p>
            {isLove && eligiblePets.length === 0 && (
              <div className="mt-3 rounded-xl bg-rose-100 border border-rose-200 px-4 py-3 text-[13px] text-rose-600 font-medium">
                All your dogs are sterilized and not eligible for Love matches.
              </div>
            )}
          </div>

          {/* ── Dog selection cards ── */}
          <div className="flex flex-col gap-4 px-4">
            {eligiblePets.map((pet) => {
              const badge = getHealthBadge(pet);
              const isSelected = selectedId === pet._id;

              return (
                <label
                  key={pet._id}
                  className={clsx(
                    "flex items-center gap-4 rounded-xl border-2 bg-white p-4 transition-all cursor-pointer",
                    isSelected
                      ? isLove
                        ? "border-rose-400 bg-rose-50/60"
                        : "border-[#e1cfb7] bg-[#e1cfb7]/5"
                      : isLove
                        ? "border-rose-200/40 hover:border-rose-300"
                        : "border-[#e1cfb7]/20 hover:border-[#e1cfb7]",
                  )}
                >
                  {/* Pet image */}
                  {pet.image ? (
                    <Image
                      src={pet.image}
                      alt={pet.name ?? "Pet"}
                      width={64}
                      height={64}
                      className="size-16 rounded-lg object-cover shrink-0 bg-[#e1cfb7]/10"
                    />
                  ) : (
                    <div className={clsx("size-16 rounded-lg flex items-center justify-center shrink-0", isLove ? "bg-rose-100" : "bg-[#e1cfb7]/20")}>
                      <span className={clsx("material-symbols-outlined text-[28px]", isLove ? "text-rose-400" : "text-[#c4a87a]")}>
                        pets
                      </span>
                    </div>
                  )}

                  {/* Pet info */}
                  <div className="flex flex-1 flex-col min-w-0">
                    <p className="text-[#1e293b] text-base font-bold truncate">
                      {pet.name ?? "—"}
                    </p>
                    <p className="text-[#64748b] text-sm">
                      {pet.breed ?? "Mixed"} • {pet.size ?? "—"}
                    </p>
                    <div className={clsx("mt-1 flex items-center gap-1 text-xs font-medium", badge.colorClass)}>
                      <span className="material-symbols-outlined text-xs leading-none">{badge.icon}</span>
                      {badge.label}
                    </div>
                  </div>

                  {/* Radio button */}
                  <input
                    type="radio"
                    name="dog-selection"
                    value={pet._id}
                    checked={isSelected}
                    onChange={() => setSelectedId(pet._id)}
                    className="size-6 shrink-0 appearance-none rounded-full border-2 cursor-pointer transition-colors"
                    style={
                      isSelected
                        ? {
                            backgroundColor: isLove ? "#f43f5e" : "#e1cfb7",
                            borderColor: isLove ? "#f43f5e" : "#e1cfb7",
                            backgroundImage: `url("data:image/svg+xml,%3csvg viewBox='0 0 16 16' fill='white' xmlns='http://www.w3.org/2000/svg'%3e%3ccircle cx='8' cy='8' r='3'/%3e%3c/svg%3e")`,
                            backgroundRepeat: "no-repeat",
                            backgroundPosition: "center",
                          }
                        : { borderColor: isLove ? "#fecdd3" : "#e1cfb7" + "66" }
                    }
                  />
                </label>
              );
            })}
          </div>

          {isCompatibilityLoading && (
            <SpinLoader title="Loading Compatibility" />
          )}
          {/* ── Compatibility panel ── */}
          {selectedPet && compatibility && (
            <div className={clsx(
              "mx-4 mt-6 mb-6 p-6 rounded-2xl bg-white shadow-sm border",
              isLove ? "border-rose-200" : "border-[#e1cfb7]/10",
            )}>
              <div className="flex items-center gap-4">
                <div className={clsx("flex size-12 shrink-0 items-center justify-center rounded-full", isLove ? "bg-rose-100" : "bg-[#e1cfb7]/20")}>
                  <span className={clsx(
                    "material-symbols-outlined text-2xl",
                    isLove ? "text-rose-400" : "text-[#c4a87a]",
                    isCompatibilityLoading && "animate-pulse",
                  )}>
                    {isLove ? "favorite" : "psychology"}
                  </span>
                </div>
                <div className="flex flex-col">
                  <p className={clsx("text-sm font-bold", isLove ? "text-rose-600" : "text-[#1e293b]")}>
                    {isLove ? "Love Compatibility" : "Compatibility"}
                  </p>
                  <p className="text-[#64748b] text-xs">
                    {compatibility?.reason ?? (isLove ? "Breed · Health · Personality" : "Breed · Vaccine · Flea & Tick")}
                  </p>
                </div>
              </div>

              <div className="mt-4 flex flex-col gap-2">
                <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider text-[#94a3b8]">
                  <span>{isLove ? "Match Score" : "Compatibility"}</span>
                  <span style={{ color }}>
                    {isCompatibilityLoading ? "…" : `${pct}%`}
                  </span>
                </div>
                <div className="h-1.5 w-full bg-slate-100 rounded-full">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: isCompatibilityLoading ? "0%" : `${pct}%`,
                      backgroundColor: color,
                    }}
                  />
                </div>
                <div className="flex gap-3 mt-1">
                  {[
                    { label: "Breed", ok: !!selectedPet.breed },
                    { label: "Vaccine", ok: !!selectedPet.vaccine },
                    { label: "Flea & Tick", ok: !!selectedPet.fleaTick },
                  ].map(({ label, ok }) => (
                    <div key={label} className="flex items-center gap-1 text-[10px] font-semibold">
                      <span
                        className="material-symbols-outlined"
                        style={{ fontSize: 12, color: ok ? "#4ade80" : "#f97316" }}
                      >
                        {ok ? "check_circle" : "cancel"}
                      </span>
                      <span className={ok ? "text-[#475569]" : "text-[#f97316]"}>{label}</span>
                    </div>
                  ))}
                </div>

                {/* Message when score < 90 */}
                {!isCompatibilityLoading && pct < 90 && (
                  <div className="mt-4 flex flex-col gap-2">
                    <p className="text-[11px] font-bold text-[#94a3b8] uppercase tracking-wider">
                      {isLove ? "Message to poster" : "Message to host"}
                    </p>
                    <textarea
                      rows={3}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder={isLove ? "Tell them why your dog would be a great match…" : "Tell the host why your dog would be a great fit…"}
                      className={clsx(
                        "w-full rounded-xl border bg-[#f7f7f6] px-3 py-2 text-[13px] text-[#1e293b] placeholder-[#94a3b8] outline-none resize-none",
                        isLove
                          ? "border-rose-200 focus:border-rose-400 focus:ring-1 focus:ring-rose-300"
                          : "border-[#e1cfb7]/40 focus:border-[#e1cfb7] focus:ring-1 focus:ring-[#e1cfb7]",
                      )}
                    />
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* ── Footer ── */}
        <footer className={clsx(
          "shrink-0 p-4 backdrop-blur-md border-t",
          isLove ? "bg-rose-50/80 border-rose-200/40" : "bg-[#f7f7f6]/80 border-[#e1cfb7]/20",
        )}>
          <button
            onClick={() => selectedId && onConfirm(selectedId, message || undefined)}
            disabled={isCompatibilityLoading || !compatibility || (pct < 90 && !message) || eligiblePets.length === 0}
            className={clsx(
              "w-full font-bold py-4 rounded-xl shadow-lg hover:scale-[0.98] active:scale-[0.95] transition-all disabled:opacity-50 disabled:pointer-events-none",
              isLove
                ? "bg-rose-500 text-white shadow-rose-200"
                : "bg-[#e1cfb7] text-[#1e293b] shadow-[#e1cfb7]/20",
              { "opacity-50 pointer-events-none": !isCompatibilityLoading && !compatibility },
            )}
          >
            {isLove
              ? "Request a Date 💕"
              : activityTitle
                ? `Join "${activityTitle}"`
                : "Continue to Activity"}
          </button>
        </footer>
      </div>
    </div>,
    document.body,
  );
}
