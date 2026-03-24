"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { useVerifyPetCard } from "@/lib/queries";

type VerifyResult = {
  microchipCode: string;
  vaccine: boolean;
  sterilizing: boolean;
  petName: string | null;
  breed: string | null;        // original (may be Thai)
  breedEnglish: string | null; // English translation for matching
};

type Props = {
  open: boolean;
  petName: string;
  petBreed?: string;
  onConfirm: (result: VerifyResult) => void;
  onClose: () => void;
};

type Step = "idle" | "preview" | "verifying" | "result" | "error";

/** Case-insensitive partial match — handles "Jora" vs "jora", "Pom" vs "Pomeranian" */
function looslyMatches(a: string | null | undefined, b: string | null | undefined): boolean {
  if (!a || !b) return true; // one side unknown → can't block
  const na = a.toLowerCase().trim();
  const nb = b.toLowerCase().trim();
  return na === nb || na.includes(nb) || nb.includes(na);
}

export default function PetCardVerifyModal({
  open,
  petName,
  petBreed,
  onConfirm,
  onClose,
}: Props) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [imageBase64, setImageBase64] = useState<string>("");
  const [mimeType, setMimeType] = useState<string>("image/jpeg");
  const [step, setStep] = useState<Step>("idle");
  const [result, setResult] = useState<VerifyResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string>("");

  const { mutate: verifyCard } = useVerifyPetCard();

  function reset() {
    setPreview(null);
    setImageBase64("");
    setStep("idle");
    setResult(null);
    setErrorMsg("");
  }

  function handleClose() {
    reset();
    onClose();
  }

  function handleFileChange(file: File) {
    setMimeType(file.type || "image/jpeg");
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      setPreview(dataUrl);
      setImageBase64(dataUrl.split(",")[1]);
      setStep("preview");
    };
    reader.readAsDataURL(file);
  }

  function handleVerify() {
    if (!imageBase64) return;
    setStep("verifying");
    verifyCard(
      { image: imageBase64, mimeType },
      {
        onSuccess: (data) => {
          setResult(data);
          setStep("result");
        },
        onError: (err) => {
          setErrorMsg(
            err instanceof Error
              ? err.message
              : "Something went wrong. Please try again.",
          );
          setStep("error");
        },
      },
    );
  }

  if (!open) return null;

  // ── Compute match status when result is ready ──────────────────────────────
  const nameMatch = result ? looslyMatches(result.petName, petName) : true;
  // Use English translation for matching so "ปอมเมอราเนียน" == "Pomeranian" works
  const breedMatch = result ? looslyMatches(result.breedEnglish ?? result.breed, petBreed) : true;
  const isBlocked = !nameMatch || !breedMatch;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-150"
      onClick={handleClose}
    >
      <div
        className="w-full max-w-sm bg-[#f7f7f6] rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom duration-300"
        style={{ maxHeight: "92dvh" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-3 shrink-0">
          <div>
            <h2 className="text-[17px] font-bold text-[#1e293b]">
              Verify with ID Card
            </h2>
            <p className="text-[12px] text-[#64748b] mt-0.5">
              Upload {petName}&apos;s pet registration card
            </p>
          </div>
          <button
            onClick={handleClose}
            className="w-8 h-8 rounded-full bg-[#f1f5f9] flex items-center justify-center hover:bg-[#e2e8f0] transition-colors"
          >
            <span className="material-symbols-outlined text-[#64748b]" style={{ fontSize: 18 }}>
              close
            </span>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 pb-5">
          {/* ── Idle ── */}
          {step === "idle" && (
            <div
              className="flex flex-col items-center justify-center gap-4 border-2 border-dashed border-[#e2cfb7] rounded-2xl py-12 cursor-pointer hover:bg-[rgba(226,207,183,0.08)] transition-colors"
              onClick={() => fileRef.current?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                const file = e.dataTransfer.files?.[0];
                if (file) handleFileChange(file);
              }}
            >
              <div className="w-16 h-16 rounded-2xl bg-[rgba(226,207,183,0.3)] flex items-center justify-center">
                <span className="material-symbols-outlined text-[#c4a87a]" style={{ fontSize: 32 }}>
                  add_a_photo
                </span>
              </div>
              <div className="text-center">
                <p className="text-[14px] font-bold text-[#1e293b]">
                  Upload pet registration card
                </p>
                <p className="text-[12px] text-[#64748b] mt-1">
                  Take a photo or choose from your library
                </p>
              </div>
              <div className="flex gap-2">
                {["JPG", "PNG", "HEIC"].map((f) => (
                  <span key={f} className="px-3 py-1 rounded-full bg-[#e2cfb7]/30 text-[11px] font-semibold text-[#64748b]">
                    {f}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* ── Preview ── */}
          {step === "preview" && preview && (
            <div className="flex flex-col gap-4">
              <div className="relative w-full aspect-[3/2] rounded-2xl overflow-hidden border border-[#e2cfb7]/40">
                <Image src={preview} alt="Pet ID card" fill className="object-cover" />
              </div>
              <p className="text-[12px] text-[#64748b] text-center">
                Make sure the microchip number at the top is clearly visible
              </p>
              <button
                onClick={reset}
                className="text-[13px] font-semibold text-[#94a3b8] hover:text-[#64748b] text-center"
              >
                Use a different photo
              </button>
            </div>
          )}

          {/* ── Verifying ── */}
          {step === "verifying" && (
            <div className="flex flex-col items-center gap-6 py-8">
              <div className="w-16 h-16 rounded-full bg-[rgba(226,207,183,0.3)] flex items-center justify-center">
                <span className="material-symbols-outlined text-[#c4a87a] animate-pulse" style={{ fontSize: 32 }}>
                  document_scanner
                </span>
              </div>
              <div className="flex flex-col gap-3 w-full">
                {[
                  "Reading microchip code from card…",
                  "Checking Bangkok pet registry…",
                  "Verifying pet identity…",
                ].map((label, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full border-2 border-[#e2cfb7] border-t-transparent animate-spin shrink-0" />
                    <p className="text-[13px] text-[#64748b]">{label}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── Result ── */}
          {step === "result" && result && (
            <div className="flex flex-col gap-4">
              {/* Microchip */}
              <div className="bg-white rounded-xl border border-[#f1f5f9] px-4 py-3 flex items-center gap-3">
                <span className="material-symbols-outlined text-[#c4a87a]" style={{ fontSize: 20 }}>
                  contactless
                </span>
                <div>
                  <p className="text-[10px] font-semibold text-[#94a3b8] uppercase tracking-wider">
                    Microchip Code
                  </p>
                  <p className="text-[13px] font-bold text-[#1e293b] font-mono tracking-wide">
                    {result.microchipCode}
                  </p>
                </div>
              </div>

              {/* ── Identity check table ── */}
              <div className="flex flex-col gap-1">
                <p className="text-[11px] font-bold text-[#94a3b8] uppercase tracking-wider mb-1">
                  Identity Check
                </p>

                {[
                  {
                    label: "Name",
                    ours: petName,
                    registry: result.petName,
                    match: nameMatch,
                  },
                  ...(petBreed || result.breed
                    ? [
                        {
                          label: "Breed",
                          ours: petBreed ?? "—",
                          registry: result.breed,
                          match: breedMatch,
                        },
                      ]
                    : []),
                ].map((row) => (
                  <div
                    key={row.label}
                    className={`flex items-center gap-3 rounded-xl px-4 py-2.5 border ${
                      row.registry === null
                        ? "bg-[#f8fafc] border-[#e2e8f0]"
                        : row.match
                          ? "bg-green-50 border-green-200"
                          : "bg-red-50 border-red-200"
                    }`}
                  >
                    <div className="w-16 shrink-0">
                      <p className="text-[10px] font-bold text-[#94a3b8] uppercase tracking-wide">
                        {row.label}
                      </p>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[11px] text-[#64748b]">Your pet:</span>
                        <span className="text-[12px] font-bold text-[#1e293b] truncate">{row.ours}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[11px] text-[#64748b]">Registry:</span>
                        <span className={`text-[12px] font-bold truncate ${row.match ? "text-green-700" : "text-red-600"}`}>
                          {row.registry ?? "Not found"}
                        </span>
                      </div>
                    </div>
                    <span
                      className={`material-symbols-outlined shrink-0 ${
                        row.registry === null
                          ? "text-[#94a3b8]"
                          : row.match
                            ? "text-green-500"
                            : "text-red-500"
                      }`}
                      style={{ fontSize: 20 }}
                    >
                      {row.registry === null ? "help" : row.match ? "check_circle" : "cancel"}
                    </span>
                  </div>
                ))}
              </div>

              {/* Mismatch blocker banner */}
              {isBlocked && (
                <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 flex items-start gap-3">
                  <span className="material-symbols-outlined text-red-500 shrink-0 mt-0.5" style={{ fontSize: 18 }}>
                    error
                  </span>
                  <div>
                    <p className="text-[13px] font-bold text-red-700">
                      Wrong card detected
                    </p>
                    <p className="text-[12px] text-red-600 mt-0.5 leading-relaxed">
                      This card belongs to a different pet. Please upload {petName}&apos;s own registration card.
                    </p>
                  </div>
                </div>
              )}

              {/* Health status */}
              {!isBlocked && (
                <>
                  <p className="text-[11px] font-bold text-[#94a3b8] uppercase tracking-wider">
                    Health Status from Registry
                  </p>
                  <div className="flex flex-col gap-2">
                    {[
                      { label: "Vaccine", ok: result.vaccine, yes: "Up to Date", no: "Not recorded" },
                      { label: "Sterilizing", ok: result.sterilizing, yes: "Done", no: "Not recorded" },
                    ].map((item) => (
                      <div
                        key={item.label}
                        className={`flex items-center gap-3 rounded-xl px-4 py-3 border ${
                          item.ok ? "bg-green-50 border-green-200" : "bg-[#f8fafc] border-[#e2e8f0]"
                        }`}
                      >
                        <span className="text-lg">{item.ok ? "✓" : "!"}</span>
                        <div className="flex-1">
                          <p className="text-[11px] font-semibold text-[#94a3b8] uppercase tracking-wide">
                            {item.label}
                          </p>
                          <p className={`text-[13px] font-bold ${item.ok ? "text-green-700" : "text-[#64748b]"}`}>
                            {item.ok ? item.yes : item.no}
                          </p>
                        </div>
                        {item.ok && (
                          <span className="material-symbols-outlined text-green-500" style={{ fontSize: 20 }}>
                            check_circle
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                  <p className="text-[11px] text-[#94a3b8] text-center">
                    Only verified fields will be updated on {petName}&apos;s profile
                  </p>
                </>
              )}
            </div>
          )}

          {/* ── Error ── */}
          {step === "error" && (
            <div className="flex flex-col items-center gap-4 py-8">
              <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center">
                <span className="material-symbols-outlined text-red-400" style={{ fontSize: 32 }}>
                  error
                </span>
              </div>
              <div className="text-center">
                <p className="text-[14px] font-bold text-[#1e293b]">Verification failed</p>
                <p className="text-[12px] text-[#64748b] mt-1 leading-relaxed">{errorMsg}</p>
              </div>
              <button onClick={reset} className="text-[13px] font-bold text-[#c4a87a] hover:opacity-80">
                Try again
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="shrink-0 px-5 pb-5 pt-2 border-t border-[#e2e8f0]">
          {step === "idle" && (
            <button
              onClick={() => fileRef.current?.click()}
              className="w-full h-12 bg-[#e2cfb7] text-[#1e293b] font-bold rounded-xl hover:opacity-90 active:scale-[0.98] transition-all"
            >
              Choose Photo
            </button>
          )}
          {step === "preview" && (
            <button
              onClick={handleVerify}
              className="w-full h-12 bg-[#e2cfb7] text-[#1e293b] font-bold rounded-xl hover:opacity-90 active:scale-[0.98] transition-all"
            >
              Verify with Registry
            </button>
          )}
          {step === "result" && result && (
            <button
              disabled={isBlocked}
              onClick={() => {
                onConfirm(result);
                handleClose();
              }}
              className="w-full h-12 font-bold rounded-xl active:scale-[0.98] transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:scale-100 bg-[#1e293b] text-white hover:opacity-90"
            >
              {isBlocked ? "Wrong Card — Cannot Apply" : `Apply to ${petName}'s Profile`}
            </button>
          )}
          {step === "result" && isBlocked && (
            <button
              onClick={reset}
              className="w-full h-10 mt-2 text-[13px] font-semibold text-[#64748b] hover:text-[#1e293b] transition-colors"
            >
              Upload the correct card
            </button>
          )}
        </div>

        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFileChange(file);
          }}
        />
      </div>
    </div>
  );
}
