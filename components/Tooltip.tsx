"use client";

import clsx from "clsx";
import { ReactNode, useState } from "react";

type Props = {
  label: string | ReactNode;
  children: ReactNode;
  isDisable?: boolean;
  position?: "top" | "bottom";
  className?: string;
};

export default function Tooltip({
  label,
  isDisable = false,
  children,
  position = "top",
  className,
}: Props) {
  const [touched, setTouched] = useState(false);

  return (
    <div
      className={clsx("relative group/tooltip inline-flex w-fit", className)}
      onTouchStart={() => !isDisable && setTouched(true)}
      onTouchEnd={() => setTimeout(() => setTouched(false), 1500)}
    >
      {children}
      {!isDisable && (
        <span
          className={clsx(
            "pointer-events-none absolute left-1/2 -translate-x-1/2 whitespace-nowrap",
            "bg-[#1e293b] text-white text-[11px] font-semibold px-2.5 py-1 rounded-lg",
            "transition-all duration-150 z-50",
            position === "top" ? "bottom-full mb-2" : "top-full mt-2",
            touched
              ? "opacity-100 scale-100"
              : "opacity-0 scale-95 group-hover/tooltip:opacity-100 group-hover/tooltip:scale-100",
          )}
        >
          {label}
          <span
            className={clsx(
              "absolute left-1/2 -translate-x-1/2 border-4 border-transparent",
              position === "top" ? "top-full border-t-[#1e293b]" : "bottom-full border-b-[#1e293b]",
            )}
          />
        </span>
      )}
    </div>
  );
}
