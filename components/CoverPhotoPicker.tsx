"use client";

import { useRef } from "react";
import Image from "next/image";
import Tooltip from "./Tooltip";

const MAX_REGENERATE = 5;

type CoverPhotoPickerProps = {
  label?: string;
  hint?: string;
  previewUrl?: string | null;
  aiImages?: string[];
  isGenerating?: boolean;
  selectedAiUrl?: string | null;
  usedCount?: number;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onAiSelect: (url: string) => void;
  onGenerate: () => void;
};

export default function CoverPhotoPicker({
  label = "Cover Photo",
  hint,
  previewUrl,
  aiImages = [],
  isGenerating = false,
  selectedAiUrl = null,
  usedCount = 0,
  onFileChange,
  onAiSelect,
  onGenerate,
}: CoverPhotoPickerProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const remaining = MAX_REGENERATE - usedCount;
  const canRegenerate = remaining > 0;

  return (
    <div>
      <label className="text-[13px] font-semibold text-[#334155] block ml-1 mb-2">
        {label}
      </label>

      {/* Upload area */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={onFileChange}
      />
      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        className="relative w-full h-48 rounded-2xl border-2 border-dashed border-[rgba(226,207,183,0.6)] bg-white flex flex-col items-center justify-center gap-2 mb-3 hover:bg-[rgba(225,207,183,0.05)] transition-colors overflow-hidden group"
      >
        {previewUrl ? (
          <>
            <Image
              src={previewUrl}
              alt="Cover preview"
              fill
              className="object-cover"
              unoptimized
            />
            <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <span
                className="material-symbols-outlined text-white"
                style={{ fontSize: 28 }}
              >
                add_a_photo
              </span>
            </div>
          </>
        ) : (
          <>
            <span className="text-3xl">📷</span>
            <p className="text-[13px] font-semibold text-[#64748b]">
              Upload a photo
            </p>
            <p className="text-[11px] text-[#94a3b8]">
              {hint ?? "or choose from AI suggestions below"}
            </p>
          </>
        )}
      </button>

      {/* AI image grid — shown after first generate */}
      {aiImages.length > 0 ? (
        <div className="flex flex-col gap-2">
          <div className="grid grid-cols-4 gap-2">
            {aiImages.map((img, i) => (
              <button
                key={i}
                type="button"
                onClick={() => onAiSelect(img)}
                className={`relative rounded-xl overflow-hidden h-16 border-2 transition-all ${
                  selectedAiUrl === img
                    ? "border-[#1e293b] scale-95"
                    : "border-transparent hover:border-[rgba(226,207,183,0.6)]"
                }`}
              >
                <Image
                  src={img}
                  alt={`AI option ${i + 1}`}
                  fill
                  className="object-cover"
                  unoptimized
                />
                {selectedAiUrl === img && (
                  <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                    <span className="text-white text-lg">✓</span>
                  </div>
                )}
              </button>
            ))}
          </div>

          {/* Re-generate row */}
          <div className="flex items-center justify-between px-1">
            <p className="text-[11px] text-[#94a3b8]">
              {canRegenerate
                ? `${remaining} of ${MAX_REGENERATE} refreshes left`
                : "Refresh limit reached"}
            </p>
            <button
              type="button"
              onClick={onGenerate}
              disabled={isGenerating || !canRegenerate}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[rgba(225,207,183,0.3)] text-[12px] font-bold text-[#1e293b] hover:bg-[rgba(225,207,183,0.5)] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <span>✨</span>
              {isGenerating ? "Generating…" : "Refresh"}
            </button>
          </div>
        </div>
      ) : (
        /* Primary generate CTA — shown before first generate */
        <Tooltip label="Your limit will refresh in the next day.">
          <button
            type="button"
            onClick={onGenerate}
            disabled={isGenerating || !canRegenerate}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-[rgba(225,207,183,0.3)] border border-[rgba(226,207,183,0.5)] text-[14px] font-bold text-[#1e293b] hover:bg-[rgba(225,207,183,0.5)] transition-colors disabled:opacity-50"
          >
            <span className="text-lg">✨</span>
            {isGenerating ? "Generating…" : "Generate with AI"}
          </button>
        </Tooltip>
      )}
    </div>
  );
}
