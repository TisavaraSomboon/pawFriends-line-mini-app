"use client";

import Image from "next/image";
import { PetEnergyLevel, usePetInsights } from "@/lib/queries";

const SECTION_CONFIG = [
  {
    key: "careTips" as const,
    title: "Daily Care Tips",
    emoji: "🐾",
    bg: "bg-[#fdf8f3]",
    border: "border-[rgba(226,207,183,0.5)]",
    iconColor: "text-[#c4a87a]",
    titleColor: "text-[#7c5c2e]",
  },
  {
    key: "agePrecautions" as const,
    title: "Age-Related Precautions",
    emoji: "📅",
    bg: "bg-[#f0fdf4]",
    border: "border-green-200",
    iconColor: "text-green-500",
    titleColor: "text-green-800",
  },
  {
    key: "diseases" as const,
    title: "Diseases to Watch",
    emoji: "🏥",
    bg: "bg-[#fff7ed]",
    border: "border-orange-200",
    iconColor: "text-orange-500",
    titleColor: "text-orange-800",
  },
  {
    key: "behaviorExpectations" as const,
    title: "Behavior to Expect",
    emoji: "🧠",
    bg: "bg-[#f8f7ff]",
    border: "border-violet-200",
    iconColor: "text-violet-500",
    titleColor: "text-violet-800",
  },
] as const;

function SkeletonSection() {
  return (
    <div className="rounded-2xl border border-[#f1f5f9] bg-white p-4 animate-pulse">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-6 h-6 rounded-full bg-[#f1f5f9]" />
        <div className="h-3.5 w-36 rounded-full bg-[#f1f5f9]" />
      </div>
      <div className="flex flex-col gap-2.5">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-start gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-[#f1f5f9] shrink-0 mt-0.5" />
            <div className="flex-1 space-y-1.5">
              <div className="h-3 rounded-full bg-[#f1f5f9]" style={{ width: `${60 + i * 10}%` }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function PetInsightsCard({
  name,
  breed,
  ageGroup,
  energyLevel,
  emotions,
  behaviorTraits,
}: {
  name: string;
  breed?: string;
  ageGroup?: string;
  energyLevel?: PetEnergyLevel;
  emotions?: string[];
  behaviorTraits?: string[];
}) {
  const { data, isLoading } = usePetInsights(
    breed || ageGroup
      ? { breed, ageGroup, energyLevel, emotions, behaviorTraits }
      : null,
  );

  if (!breed && !ageGroup) return null;

  return (
    <div className="flex flex-col gap-4">
      {/* Header banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#e2cfb7] to-[#f5ede0] border border-[rgba(226,207,183,0.6)] px-5 py-4 flex items-center gap-4">
        {data?.illustrationUrl ? (
          <div className="w-20 h-20 rounded-2xl overflow-hidden shrink-0 shadow-md ring-2 ring-white">
            <Image
              src={data.illustrationUrl}
              alt={`${breed ?? "dog"} illustration`}
              width={80}
              height={80}
              className="w-full h-full object-cover"
            />
          </div>
        ) : (
          <div className="w-20 h-20 rounded-2xl bg-white/60 flex items-center justify-center shrink-0 shadow-md ring-2 ring-white text-5xl select-none">
            🐶
          </div>
        )}
        <div className="flex-1 min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-[#7c5c2e] mb-0.5">
            AI Care Guide
          </p>
          <h3 className="text-[17px] font-extrabold text-[#1e293b] leading-tight">
            {name}&apos;s Personalised Insights
          </h3>
          <p className="text-[12px] text-[#64748b] mt-1 leading-snug">
            Based on breed, age &amp; behaviour profile
          </p>
        </div>
        {/* decorative paw */}
        <span
          className="material-symbols-outlined absolute -right-3 -bottom-3 opacity-10 text-[#7c5c2e] select-none pointer-events-none"
          style={{ fontSize: 80 }}
        >
          pets
        </span>
      </div>

      {/* Sections */}
      {isLoading
        ? SECTION_CONFIG.map((s) => <SkeletonSection key={s.key} />)
        : SECTION_CONFIG.map((section) => {
            const items = data?.[section.key] ?? [];
            if (items.length === 0) return null;
            return (
              <div
                key={section.key}
                className={`rounded-2xl border ${section.border} ${section.bg} p-4`}
              >
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-[16px]">{section.emoji}</span>
                  <p className={`text-[13px] font-bold ${section.titleColor}`}>
                    {section.title}
                  </p>
                </div>
                <div className="flex flex-col gap-2.5">
                  {items.map((item, idx) => (
                    <div key={idx} className="flex items-start gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-white/80 flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                        <span
                          className={`material-symbols-outlined ${section.iconColor}`}
                          style={{ fontSize: 16 }}
                        >
                          {item.icon}
                        </span>
                      </div>
                      <p className="text-[13px] text-[#334155] leading-snug flex-1">
                        {item.text}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
    </div>
  );
}
