"use client";

import { ReactNode, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import clsx from "clsx";

type ConfirmModalProps = {
  open: boolean;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  confirmClassName?: string;
  icon?: ReactNode;
  onConfirm: () => void;
  onCancel: () => void;
};

export default function ConfirmModal({
  open,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  confirmClassName,
  icon,
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  if (!open || !mounted) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[9998] flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm px-4 pb-6 sm:pb-0 animate-in fade-in duration-150"
      onClick={onCancel}
    >
      <div
        className="w-full max-w-sm bg-white rounded-3xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 sm:slide-in-from-bottom-0 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top accent bar */}
        <div className="h-1 w-full bg-[#e2cfb7]" />

        <div className="p-6 flex flex-col items-center text-center gap-4">
          {icon && (
            <div className="w-14 h-14 rounded-full bg-[rgba(226,207,183,0.2)] border border-[rgba(226,207,183,0.4)] flex items-center justify-center">
              {icon}
            </div>
          )}

          <div className="flex flex-col gap-1">
            <h3 className="text-[17px] font-bold text-[#1e293b]">{title}</h3>
            {description && (
              <p className="text-[13px] text-[#64748b] leading-relaxed">
                {description}
              </p>
            )}
          </div>

          <div className="flex gap-3 w-full mt-1">
            <button
              onClick={onCancel}
              className="flex-1 py-3 rounded-xl border border-[#e2e8f0] bg-white text-[13px] font-bold text-[#64748b] hover:bg-[#f8fafc] active:scale-95 transition-all"
            >
              {cancelLabel}
            </button>
            <button
              onClick={onConfirm}
              className={clsx(
                "flex-1 py-3 rounded-xl text-[13px] font-bold active:scale-95 transition-all",
                confirmClassName ??
                  "bg-[#e2cfb7] text-[#1e293b] hover:bg-[#d4bfa3]",
              )}
            >
              {confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
