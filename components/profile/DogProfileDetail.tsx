"use client";

import { useState } from "react";
import { PetEnergyLevel } from "@/lib/queries";
import ConfirmModal from "@/components/ConfirmModal";
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
  onMarkSterilized,
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
  onMarkSterilized?: () => void;
}) {
  const [confirmOpen, setConfirmOpen] = useState(false);

  return (
    <div className="flex flex-col gap-5">
      <ConfirmModal
        open={confirmOpen}
        title={`Is ${name} already sterilized?`}
        description="This will mark the pet as sterilized. This action cannot be undone."
        confirmLabel="Yes, sterilized"
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
          setConfirmOpen(false);
          onMarkSterilized?.();
        }}
        onCancel={() => setConfirmOpen(false)}
      />

      <div className="flex flex-col gap-4">
        <div className="flex justify-between">
          <h3 className="text-[18px] font-bold text-[#1e293b] tracking-tight">
            <span className="round-full h-4 w-4 mr-2 rounded-full bg-[rgba(226,207,183,0.25)] border border-[rgba(226,207,183,0.5)] text-[12px] p-2">
              🐾
            </span>{" "}
            {name}&apos;s Profile
          </h3>
          <button
            disabled={sterilizing}
            onClick={() => setConfirmOpen(true)}
            className={clsx(
              "px-3 py-1.5 rounded-full border text-[12px] font-semibold flex items-center gap-1",
              sterilizing
                ? "border-green-200 bg-green-50 text-green-700"
                : "bg-amber-50 border-amber-200 text-amber-700 hover:bg-amber-100 cursor-pointer",
            )}
          >
            {sterilizing ? (
              <>
                <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
                  heart_check
                </span>
                Sterilized
              </>
            ) : (
              <>
                <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
                  heart_plus
                </span>
                Not yet sterilized.
              </>
            )}
          </button>
        </div>
        <p className="text-[12px] font-medium text-[#64748b] mt-0.5">{breed}</p>
      </div>

      {/* Health badges */}
      <div className="flex gap-3">
        {[
          {
            label: "Vaccine",
            value: vaccine ? "Up to Date" : "Not yet",
            ok: vaccine === true,
            icon: vaccine === true ? "✓" : "!",
          },
          {
            label: "Flea & Tick",
            value: fleaTick ? "Protected" : "At Risk",
            ok: fleaTick === true,
            icon: fleaTick === true ? "🛡" : "⚠",
          },
        ].map((badge) => (
          <div
            key={badge.label}
            className={`flex-1 flex items-center gap-3 rounded-xl px-4 py-3 border ${badge.ok ? "bg-green-50 border-green-200" : "bg-amber-50 border-amber-200"}`}
          >
            <span className="text-lg">{badge.icon}</span>
            <div>
              <p className="text-[10px] font-semibold text-[#64748b] uppercase tracking-wide">
                {badge.label}
              </p>
              <p className={`text-[13px] font-bold ${badge.ok ? "text-green-700" : "text-amber-700"}`}>
                {badge.value}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Energy level */}
      <div>
        <div className="flex justify-between items-center mb-2">
          <p className="text-[13px] font-semibold text-[#1e293b]">Energy Level</p>
          <p className="text-[12px] font-bold text-[#e2cfb7]">{energyLevel}</p>
        </div>
        <div className="flex gap-2">
          {Array.from({ length: 4 }, (_, i) => i).map((dot) => (
            <div
              key={dot}
              className={clsx(
                "flex-1 h-2 rounded-full",
                energyLevel && dot <= energyLevel ? "bg-[#e2cfb7]" : "bg-[#e2e8f0]",
              )}
            />
          ))}
        </div>
      </div>

      {/* Emotional profile */}
      <div>
        <p className="text-[13px] font-semibold text-[#1e293b] mb-2">Emotional Profile</p>
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
        <p className="text-[13px] font-bold text-[#1e293b] mb-2">💬 Social Behavior</p>
        <p className="text-[13px] text-[#475569] leading-relaxed">{socialStyle}</p>
      </div>

      {/* Key behaviors */}
      <div>
        <p className="text-[13px] font-semibold text-[#1e293b] mb-2">Key Behaviors</p>
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
        <p className="text-[13px] font-semibold text-[#1e293b] mb-2">Good With</p>
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
        <p className="text-[13px] font-bold text-amber-800 mb-1">⚠️ Before You Meet</p>
        <p className="text-[13px] text-amber-900 leading-relaxed">{considerNote}</p>
      </div>
    </div>
  );
}
