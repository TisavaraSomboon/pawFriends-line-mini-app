"use client";

import { useState } from "react";
import { PetEnergyLevel } from "@/lib/queries";
import ConfirmModal from "@/components/ConfirmModal";
import PetCardVerifyModal from "@/components/profile/PetCardVerifyModal";
import VaccineVerifyModal from "@/components/profile/VaccineVerifyModal";
import clsx from "clsx";

export default function DogProfileDetail({
  name,
  vaccine,
  fleaTick,
  breed,
  energyLevel,
  emotions,
  socialStyle,
  behaviorTraits,
  goodWith,
  considerNote,
  sterilizing,
  microchipVerified,
  onMarkHealth,
}: {
  name: string;
  vaccine?: boolean;
  fleaTick?: boolean;
  breed?: string;
  energyLevel?: PetEnergyLevel;
  emotions?: string[];
  socialStyle?: string;
  behaviorTraits?: string[];
  goodWith?: string[];
  considerNote?: string;
  sterilizing?: boolean;
  microchipVerified?: boolean;
  onMarkHealth?: (body: {
    sterilizing?: boolean;
    vaccine?: boolean;
    fleaTick?: boolean;
    microchipVerified?: boolean;
  }) => void;
}) {
  const [confirmFleaTick, setConfirmFleaTick] = useState<boolean>();
  const [verifyOpen, setVerifyOpen] = useState(false);
  const [vaccineVerifyOpen, setVaccineVerifyOpen] = useState(false);

  return (
    <div className="flex flex-col gap-5">
      <VaccineVerifyModal
        open={vaccineVerifyOpen}
        petName={name}
        onClose={() => setVaccineVerifyOpen(false)}
        onConfirm={() => onMarkHealth?.({ vaccine: true })}
      />
      <PetCardVerifyModal
        open={verifyOpen}
        petName={name}
        petBreed={breed}
        onClose={() => setVerifyOpen(false)}
        onConfirm={(result) => {
          const update: {
            vaccine?: boolean;
            sterilizing?: boolean;
            microchipVerified?: boolean;
          } = {
            microchipVerified: true,
          };
          if (result.vaccine) update.vaccine = true;
          if (result.sterilizing) update.sterilizing = true;
          onMarkHealth?.(update);
        }}
      />
      <ConfirmModal
        open={!!confirmFleaTick}
        title={`Is ${name} already ${confirmFleaTick}?`}
        description={`This will mark the pet as ${confirmFleaTick}. This action cannot be undone.`}
        confirmLabel={`Yes, ${confirmFleaTick}`}
        cancelLabel="Not yet"
        confirmClassName="bg-green-500 text-white hover:bg-green-600"
        icon={
          <span
            className="material-symbols-outlined text-[#e2cfb7]"
            style={{ fontSize: 28 }}
          >
            heart_check
          </span>
        }
        onConfirm={() => {
          if (confirmFleaTick) onMarkHealth?.({ fleaTick: true });
          setConfirmFleaTick(false);
        }}
        onCancel={() => setConfirmFleaTick(false)}
      />

      <div className="flex flex-col gap-4">
        <div className="flex justify-between items-start">
          <div className="flex flex-col gap-1.5">
            <h3 className="text-[18px] font-bold text-[#1e293b] tracking-tight">
              <span className="round-full h-4 w-4 mr-2 rounded-full bg-[rgba(226,207,183,0.25)] border border-[rgba(226,207,183,0.5)] text-[12px] p-2">
                🐾
              </span>{" "}
              {name}&apos;s Profile
            </h3>
          </div>
          <div className="flex gap-2">
            {microchipVerified ? (
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
                sterilizing
                  ? "border-green-200 bg-green-50 text-green-700"
                  : "bg-amber-50 border-amber-200 text-amber-700",
              )}
            >
              {sterilizing ? (
                <>
                  <span
                    className="material-symbols-outlined"
                    style={{ fontSize: 18 }}
                  >
                    heart_check
                  </span>
                  Sterilized
                </>
              ) : (
                <>
                  <span
                    className="material-symbols-outlined"
                    style={{ fontSize: 18 }}
                  >
                    heart_plus
                  </span>
                  Not yet sterilized.
                </>
              )}
            </div>
          </div>
        </div>
        <p className="text-[12px] font-medium text-[#64748b] mt-0.5">{breed}</p>
      </div>

      {/* Health badges */}
      <div className="flex gap-3">
        {[
          {
            key: "vaccine",
            label: "Vaccine",
            value: vaccine ? "Up to Date" : "Not yet",
            ok: vaccine === true,
            icon: vaccine === true ? "✓" : "!",
          },
          {
            key: "fleaTick",
            label: "Flea & Tick",
            value: fleaTick ? "Protected" : "At Risk",
            ok: fleaTick === true,
            icon: fleaTick === true ? "🛡" : "⚠",
          },
        ].map((badge) => (
          <button
            key={badge.label}
            className={clsx(
              "flex-1 flex items-center gap-3 rounded-xl px-4 py-3 border cursor-pointer",
              {
                "bg-green-50 border-green-200": badge.ok,
                "bg-amber-50 border-amber-200": !badge.ok,
              },
            )}
            onClick={() => {
              if (!badge.ok) {
                if (badge.key === "vaccine") setVaccineVerifyOpen(true);
                else setConfirmFleaTick(true);
              }
            }}
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
          </button>
        ))}
      </div>

      {/* Verify with ID card — hidden once verified */}
      {!microchipVerified && (
        <button
          onClick={() => setVerifyOpen(true)}
          className="flex items-center gap-3 w-full rounded-xl border border-dashed border-[#e2cfb7] px-4 py-3 hover:bg-[rgba(226,207,183,0.1)] transition-colors"
        >
          <div className="w-9 h-9 rounded-lg bg-[rgba(226,207,183,0.3)] flex items-center justify-center shrink-0">
            <span
              className="material-symbols-outlined text-[#c4a87a]"
              style={{ fontSize: 20 }}
            >
              id_card
            </span>
          </div>
          <div className="flex-1 text-left">
            <p className="text-[13px] font-bold text-[#1e293b]">
              Verify with Bangkok ID Card
            </p>
            <p className="text-[11px] text-[#64748b]">
              Upload pet registration card to auto-verify vaccine &amp;
              sterilizing
            </p>
          </div>
          <span
            className="material-symbols-outlined text-[#94a3b8]"
            style={{ fontSize: 18 }}
          >
            chevron_right
          </span>
        </button>
      )}

      {/* Energy level */}
      <div>
        <div className="flex justify-between items-center mb-2">
          <p className="text-[13px] font-semibold text-[#1e293b]">
            Energy Level
          </p>
          <p className="text-[12px] font-bold text-[#e2cfb7]">{energyLevel}</p>
        </div>
        <div className="flex gap-2">
          {Array.from({ length: 4 }, (_, i) => i).map((dot) => (
            <div
              key={dot}
              className={clsx(
                "flex-1 h-2 rounded-full",
                energyLevel &&
                  dot <= Object.values(PetEnergyLevel).indexOf(energyLevel)
                  ? "bg-[#e2cfb7]"
                  : "bg-[#e2e8f0]",
              )}
            />
          ))}
        </div>
      </div>

      {/* Emotional profile */}
      <div>
        <p className="text-[13px] font-semibold text-[#1e293b] mb-2">
          Emotional Profile
        </p>
        <div className="flex flex-wrap gap-2">
          {emotions?.map((e) => (
            <span
              key={e}
              className="px-3 py-1.5 rounded-full bg-[rgba(226,207,183,0.25)] border border-[rgba(226,207,183,0.5)] text-[12px] font-semibold text-[#334155]"
            >
              {e}
            </span>
          ))}
        </div>
      </div>

      {/* Social behavior */}
      <div className="bg-white rounded-xl border border-[#f1f5f9] p-4">
        <p className="text-[13px] font-bold text-[#1e293b] mb-2">
          💬 Social Behavior
        </p>
        <p className="text-[13px] text-[#475569] leading-relaxed">
          {socialStyle}
        </p>
      </div>

      {/* Key behaviors */}
      <div>
        <p className="text-[13px] font-semibold text-[#1e293b] mb-2">
          Key Behaviors
        </p>
        <div className="flex flex-col gap-2">
          {behaviorTraits?.map((t) => (
            <div key={t} className="flex items-center gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-[#e2cfb7] shrink-0" />
              <p className="text-[13px] font-medium text-[#334155]">{t}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Good with */}
      <div>
        <p className="text-[13px] font-semibold text-[#1e293b] mb-2">
          Good With
        </p>
        <div className="flex flex-wrap gap-2">
          {goodWith?.map((g) => (
            <span
              key={g}
              className="px-3 py-1.5 rounded-full bg-green-50 border border-green-200 text-[12px] font-semibold text-green-700"
            >
              ✓ {g}
            </span>
          ))}
        </div>
      </div>

      {/* Before you meet */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
        <p className="text-[13px] font-bold text-amber-800 mb-1">
          ⚠️ Before You Meet
        </p>
        <p className="text-[13px] text-amber-900 leading-relaxed">
          {considerNote}
        </p>
      </div>
    </div>
  );
}
