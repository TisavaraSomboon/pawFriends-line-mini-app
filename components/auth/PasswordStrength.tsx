"use client";

import { validatePassword } from "@/lib/validation";

export default function PasswordStrength({ password }: { password: string }) {
  if (!password) return null;

  const { rules, valid } = validatePassword(password);
  const passedCount = rules.filter((r) => r.valid).length;

  // Strength bar color
  const strengthColor =
    passedCount <= 2 ? "bg-red-400" :
    passedCount <= 4 ? "bg-amber-400" :
    "bg-green-400";

  const strengthLabel =
    passedCount <= 2 ? "Weak" :
    passedCount <= 4 ? "Fair" :
    valid ? "Strong" : "Almost there";

  return (
    <div className="flex flex-col gap-2 mt-2">
      {/* Strength bar */}
      <div className="flex items-center gap-2">
        <div className="flex-1 flex gap-1">
          {rules.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                i < passedCount ? strengthColor : "bg-[#e2e8f0]"
              }`}
            />
          ))}
        </div>
        <span className={`text-[11px] font-bold w-16 text-right ${
          passedCount <= 2 ? "text-red-500" :
          passedCount <= 4 ? "text-amber-500" :
          "text-green-600"
        }`}>
          {strengthLabel}
        </span>
      </div>

      {/* Rules checklist */}
      <div className="flex flex-col gap-1">
        {rules.map((rule) => (
          <div key={rule.label} className="flex items-center gap-2">
            <span className={`material-symbols-outlined transition-colors ${
              rule.valid ? "text-green-500" : "text-[#cbd5e1]"
            }`} style={{ fontSize: 14 }}>
              {rule.valid ? "check_circle" : "radio_button_unchecked"}
            </span>
            <span className={`text-[12px] transition-colors ${
              rule.valid ? "text-green-700" : "text-[#94a3b8]"
            }`}>
              {rule.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
