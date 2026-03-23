"use client";

import { useRef, useState, KeyboardEvent, ClipboardEvent } from "react";
import clsx from "clsx";

interface OtpInputProps {
  email: string;
  onComplete: (code: string) => void;
  onBack: () => void;
  isVerifying?: boolean;
  error?: string;
}

export default function OtpInput({
  email,
  onComplete,
  onBack,
  isVerifying,
  error,
}: OtpInputProps) {
  const [digits, setDigits] = useState<string[]>(Array(6).fill(""));
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  function handleChange(index: number, value: string) {
    const digit = value.replace(/\D/g, "").slice(-1);
    const next = [...digits];
    next[index] = digit;
    setDigits(next);

    if (digit && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    if (next.every((d) => d !== "")) {
      onComplete(next.join(""));
    }
  }

  function handleKeyDown(index: number, e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Backspace") {
      if (digits[index]) {
        const next = [...digits];
        next[index] = "";
        setDigits(next);
      } else if (index > 0) {
        inputRefs.current[index - 1]?.focus();
      }
    }
  }

  function handlePaste(e: ClipboardEvent<HTMLInputElement>) {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!pasted) return;

    const next = Array(6).fill("");
    pasted.split("").forEach((char, i) => {
      next[i] = char;
    });
    setDigits(next);

    const lastFilledIndex = Math.min(pasted.length - 1, 5);
    inputRefs.current[lastFilledIndex]?.focus();

    if (pasted.length === 6) {
      onComplete(pasted);
    }
  }

  return (
    <div className="flex flex-col gap-0">
      <p className="text-[13px] text-[#64748b] mb-6 ml-1">
        We sent a 6-digit code to{" "}
        <span className="font-semibold text-[#1e293b]">{email}</span>
      </p>

      {/* Digit boxes */}
      <div className="flex gap-3 justify-between mb-1">
        {digits.map((digit, i) => (
          <input
            key={i}
            ref={(el) => {
              inputRefs.current[i] = el;
            }}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={digit}
            onChange={(e) => handleChange(i, e.target.value)}
            onKeyDown={(e) => handleKeyDown(i, e)}
            onPaste={handlePaste}
            className={clsx(
              "w-12 h-14 rounded-[14px] border text-center text-[22px] font-bold text-[#1e293b] outline-none transition-all",
              "bg-white placeholder-[#94a3b8]",
              digit
                ? "border-[#e2cfb7] ring-2 ring-[rgba(226,207,183,0.4)]"
                : "border-[rgba(226,207,183,0.4)]",
              "focus:border-[#e2cfb7] focus:ring-2 focus:ring-[rgba(226,207,183,0.3)]",
              error && "border-red-400 focus:border-red-400 focus:ring-red-100",
            )}
          />
        ))}
      </div>

      {error ? (
        <p className="text-[12px] text-red-500 mb-4 ml-1">{error}</p>
      ) : (
        <div className="mb-5" />
      )}

      <button
        onClick={() => onComplete(digits.join(""))}
        disabled={digits.some((d) => !d) || isVerifying}
        className="h-14 rounded-[14px] bg-[#e2cfb7] flex items-center justify-center shadow-sm hover:opacity-90 transition-opacity w-full disabled:opacity-50"
      >
        <span className="text-[17px] font-bold text-[#1e293b]">
          {isVerifying ? "Verifying…" : "Verify Code"}
        </span>
      </button>

      <button
        onClick={onBack}
        className="mt-4 text-[13px] font-semibold text-[#64748b] hover:text-[#1e293b] transition-colors text-center"
      >
        ← Use a different email
      </button>
    </div>
  );
}
