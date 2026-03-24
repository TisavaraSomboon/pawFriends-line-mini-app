"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { useVerifyVaccine } from "@/lib/queries";

type VaccineRecord = {
  name: string;
  date: string;
  nextDate: string | null;
  isCurrent: boolean;
};

type VerifyResult = {
  vaccines: VaccineRecord[];
  hasCurrentVaccine: boolean;
  summary: string;
};

type Props = {
  open: boolean;
  petName: string;
  onConfirm: () => void;
  onClose: () => void;
};

type Step = "idle" | "preview" | "verifying" | "result" | "error";

export default function VaccineVerifyModal({ open, petName, onConfirm, onClose }: Props) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [imageBase64, setImageBase64] = useState("");
  const [mimeType, setMimeType] = useState("image/jpeg");
  const [step, setStep] = useState<Step>("idle");
  const [result, setResult] = useState<VerifyResult | null>(null);
  const [errorMsg, setErrorMsg] = useState("");

  const { mutate: verifyVaccine } = useVerifyVaccine();

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
    verifyVaccine(
      { image: imageBase64, mimeType },
      {
        onSuccess: (data) => {
          setResult(data);
          setStep("result");
        },
        onError: (err) => {
          setErrorMsg(
            err instanceof Error ? err.message : "Something went wrong. Please try again.",
          );
          setStep("error");
        },
      },
    );
  }

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-9999 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-150"
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
            <h2 className="text-[17px] font-bold text-[#1e293b]">Verify Vaccine</h2>
            <p className="text-[12px] text-[#64748b] mt-0.5">
              Upload {petName}&apos;s vaccination booklet
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
                  vaccines
                </span>
              </div>
              <div className="text-center">
                <p className="text-[14px] font-bold text-[#1e293b]">Upload vaccination booklet</p>
                <p className="text-[12px] text-[#64748b] mt-1">
                  Open to the page showing this year&apos;s vaccines
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
              <div className="relative w-full aspect-3/2 rounded-2xl overflow-hidden border border-[#e2cfb7]/40">
                <Image src={preview} alt="Vaccination booklet" fill className="object-cover" />
              </div>
              <p className="text-[12px] text-[#64748b] text-center">
                Make sure the vaccine stickers and dates are clearly visible
              </p>
              <button onClick={reset} className="text-[13px] font-semibold text-[#94a3b8] hover:text-[#64748b] text-center">
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
                  "Scanning vaccine stickers…",
                  "Reading vaccination dates…",
                  "Checking current year coverage…",
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
              {/* Summary banner */}
              <div
                className={`rounded-xl px-4 py-3 flex items-start gap-3 border ${
                  result.hasCurrentVaccine
                    ? "bg-green-50 border-green-200"
                    : "bg-amber-50 border-amber-200"
                }`}
              >
                <span
                  className={`material-symbols-outlined shrink-0 mt-0.5 ${result.hasCurrentVaccine ? "text-green-500" : "text-amber-500"}`}
                  style={{ fontSize: 20 }}
                >
                  {result.hasCurrentVaccine ? "check_circle" : "warning"}
                </span>
                <div>
                  <p className={`text-[13px] font-bold ${result.hasCurrentVaccine ? "text-green-700" : "text-amber-700"}`}>
                    {result.hasCurrentVaccine ? "Current vaccine found!" : "No current vaccine detected"}
                  </p>
                  <p className={`text-[12px] mt-0.5 leading-relaxed ${result.hasCurrentVaccine ? "text-green-600" : "text-amber-600"}`}>
                    {result.summary}
                  </p>
                </div>
              </div>

              {/* Vaccine records list */}
              {result.vaccines.length > 0 && (
                <>
                  <p className="text-[11px] font-bold text-[#94a3b8] uppercase tracking-wider">
                    Detected Vaccines ({result.vaccines.length})
                  </p>
                  <div className="flex flex-col gap-2">
                    {result.vaccines.map((v, i) => (
                      <div
                        key={i}
                        className={`rounded-xl px-4 py-3 border flex items-start gap-3 ${
                          v.isCurrent
                            ? "bg-green-50 border-green-200"
                            : "bg-[#f8fafc] border-[#e2e8f0]"
                        }`}
                      >
                        <span className={`text-base mt-0.5 ${v.isCurrent ? "" : "grayscale opacity-50"}`}>
                          💉
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="text-[13px] font-bold text-[#1e293b] truncate">{v.name}</p>
                          <p className="text-[11px] text-[#64748b] mt-0.5">
                            Vaccinated: {v.date}
                            {v.nextDate && (
                              <span className="ml-2 text-[#94a3b8]">· Next: {v.nextDate}</span>
                            )}
                          </p>
                        </div>
                        {v.isCurrent && (
                          <span className="material-symbols-outlined text-green-500 shrink-0" style={{ fontSize: 18 }}>
                            check_circle
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </>
              )}

              {!result.hasCurrentVaccine && (
                <p className="text-[12px] text-[#94a3b8] text-center leading-relaxed">
                  No vaccine sticker from this year was detected. Please update your pet&apos;s vaccines and try again.
                </p>
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
              Scan Vaccination Booklet
            </button>
          )}
          {step === "result" && result && (
            <button
              disabled={!result.hasCurrentVaccine}
              onClick={() => {
                onConfirm();
                handleClose();
              }}
              className="w-full h-12 font-bold rounded-xl active:scale-[0.98] transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:scale-100 bg-[#1e293b] text-white hover:opacity-90"
            >
              {result.hasCurrentVaccine
                ? `Confirm ${petName}'s Vaccine is Up to Date`
                : "Vaccine Not Current — Cannot Confirm"}
            </button>
          )}
          {step === "result" && !result?.hasCurrentVaccine && (
            <button
              onClick={reset}
              className="w-full h-10 mt-2 text-[13px] font-semibold text-[#64748b] hover:text-[#1e293b] transition-colors"
            >
              Try a different photo
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
