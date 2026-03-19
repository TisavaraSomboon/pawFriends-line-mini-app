"use client";

import { ReactNode } from "react";

type Props = {
  label: string;
  children: ReactNode;
  position?: "top" | "bottom";
};

export default function Tooltip({ label, children, position = "top" }: Props) {
  return (
    <div className="relative group/tooltip inline-flex w-full">
      {children}
      <span
        className={`
          pointer-events-none absolute left-1/2 -translate-x-1/2 whitespace-nowrap
          bg-[#1e293b] text-white text-[11px] font-semibold px-2.5 py-1 rounded-lg
          opacity-0 scale-95 group-hover/tooltip:opacity-100 group-hover/tooltip:scale-100
          transition-all duration-150 z-50
          ${position === "top" ? "bottom-full mb-2" : "top-full mt-2"}
        `}
      >
        {label}
        {/* Arrow */}
        <span
          className={`absolute left-1/2 -translate-x-1/2 border-4 border-transparent
            ${position === "top" ? "top-full border-t-[#1e293b]" : "bottom-full border-b-[#1e293b]"}
          `}
        />
      </span>
    </div>
  );
}
